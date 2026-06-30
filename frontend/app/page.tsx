"use client";
import { useState, useEffect, useCallback } from "react";

import { User, FeedItem, Pagination } from "./types";
import { API, CATEGORIES } from "./constants";
import { loadGlobal, saveGlobal } from "./helpers";

import LoginScreen from "@/components/auth/LoginScreen";
import FeedCard, { submitFeedbackToApi } from "@/components/Feed/FeedCard";
import SourcesTab from "@/components/Feed/SourcesTab";
import DiscoverTab from "@/components/Feed/DiscoverTab";
import SettingsTab from "@/components/Feed/SettingsTab";
import Sidebar from "@/components/layout/Sidebar";
import { Spinner, EmptyState } from "@/components/ui/SharedUI";

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,           setUser]           = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [feed,           setFeed]           = useState<FeedItem[]>([]);
  const [pagination,     setPagination]     = useState<Pagination>({ page: 1, limit: 20, total_count: 0, total_pages: 1 });
  const [loading,        setLoading]        = useState(false);
  const [loadingMore,    setLoadingMore]    = useState(false);
  const [activeTab,      setActiveTab]      = useState("feed");
  const [showBookmarks,  setShowBookmarks]  = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [personalized,   setPersonalized]   = useState(false);
  const [theme,          setTheme]          = useState<"dark" | "light">("dark");

  // Bookmarks persisted in localStorage
  const [bookmarks, setBookmarks] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    return new Set<number>(loadGlobal<number[]>("ts_bookmarks", []));
  });

  // Likes kept in memory; feedback is immediately sent to backend
  const [likes, setLikes] = useState<Map<number, boolean>>(new Map());

  // ── Bootstrap ───────────────────────────────────────────────────────────────
  useEffect(() => {
    try { const r = localStorage.getItem("ts_user"); if (r) setUser(JSON.parse(r)); } catch {}
    const saved = (localStorage.getItem("ts_theme") as "dark" | "light") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  // ── Theme ───────────────────────────────────────────────────────────────────
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("ts_theme", next);
  }

  // ── Feed fetching ────────────────────────────────────────────────────────────
  const fetchFeed = useCallback(async (page = 1, category = "all", replace = true) => {
    if (page === 1) setLoading(true); else setLoadingMore(true);
    try {
      const catParam = category !== "all" ? `&category=${category}` : "";
      const endpoint = personalized ? "personalized" : "";
      const url = endpoint
        ? `${API}/api/feed/personalized?page=${page}&limit=20${catParam}`
        : `${API}/api/feed?page=${page}&limit=20${catParam}`;

      const res  = await fetch(url);
      const data = await res.json();

      const items: FeedItem[] = (data.data || []).map((item: FeedItem) => ({
        ...item,
        liked:      likes.get(item.id) ?? null,
        bookmarked: bookmarks.has(item.id),
      }));

      setFeed(prev => replace ? items : [...prev, ...items]);
      setPagination(data.pagination || { page, limit: 20, total_count: items.length, total_pages: 1 });
    } catch (e) { console.error("Feed fetch error:", e); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [likes, bookmarks, personalized]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) fetchFeed(1, activeCategory, true);
  }, [user, activeCategory, personalized]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh every 5 minutes when on the feed tab
  useEffect(() => {
    if (!user || activeTab !== "feed") return;
    const id = window.setInterval(() => fetchFeed(1, activeCategory, true), 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [user, activeTab, activeCategory, fetchFeed]);

  // ── Interactions ─────────────────────────────────────────────────────────────
  function handleLike(id: number, liked: boolean) {
    const current   = likes.get(id);
    const newValue  = current === liked ? undefined : liked;

    // Optimistic UI
    setLikes(m => { const n = new Map(m); newValue === undefined ? n.delete(id) : n.set(id, newValue); return n; });
    setFeed(f => f.map(i => i.id === id ? { ...i, liked: newValue ?? null } : i));

    // Persist to backend
    if (newValue !== undefined) submitFeedbackToApi(id, newValue);
  }

  function handleBookmark(id: number) {
    setBookmarks(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      saveGlobal("ts_bookmarks", [...n]);
      return n;
    });
    setFeed(f => f.map(i => i.id === id ? { ...i, bookmarked: !i.bookmarked } : i));
  }

  function handleLogout() {
    localStorage.removeItem("ts_user");
    setUser(null);
  }

  // ── Filtered view ────────────────────────────────────────────────────────────
  const filtered = showBookmarks
    ? feed.filter(i => i.bookmarked)
    : searchQuery
    ? feed.filter(i =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : feed;

  // ── Login gate ───────────────────────────────────────────────────────────────
  if (!user) return <LoginScreen onLogin={u => setUser(u)}/>;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 8px var(--accent)} 50%{opacity:.6;box-shadow:0 0 4px var(--accent)} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        .sb      { display:flex!important }
        .mob-btn { display:none!important }
        .cat-top { display:flex!important }
        @media(max-width:768px){
          .sb      { display:none!important }
          .mob-btn { display:flex!important }
          .cat-top { display:none!important }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

        {/* Desktop sidebar */}
        <div className="sb" style={{ position: "sticky", top: 0, height: "100vh" }}>
          <Sidebar user={user} activeCategory={activeCategory} setActiveCategory={setActiveCategory} activeTab={activeTab} setActiveTab={setActiveTab} showBookmarks={showBookmarks} setShowBookmarks={setShowBookmarks} bookmarkCount={bookmarks.size}/>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
            <div onClick={() => setMobileOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }}/>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, zIndex: 201 }}>
              <Sidebar user={user} activeCategory={activeCategory} setActiveCategory={setActiveCategory} activeTab={activeTab} setActiveTab={setActiveTab} showBookmarks={showBookmarks} setShowBookmarks={setShowBookmarks} bookmarkCount={bookmarks.size} onClose={() => setMobileOpen(false)}/>
            </div>
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Sticky header — uses CSS var so it adapts to theme */}
          <div style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--bg-glass)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "0.5px solid var(--border)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>

            <button className="mob-btn" onClick={() => setMobileOpen(true)} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 8, padding: "7px 12px", color: "var(--text2)", cursor: "pointer", fontSize: 15 }}>☰</button>

            {activeTab === "feed" && (
              <>
                <div style={{ flex: 1, position: "relative", maxWidth: 520 }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontSize: 14, pointerEvents: "none" }}>⌕</span>
                  <input
                    placeholder="Filter feed…" value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    style={{ width: "100%", background: "var(--surface)", border: `0.5px solid ${searchFocused ? "rgba(59,158,255,0.4)" : "var(--border)"}`, borderRadius: 10, padding: "9px 12px 9px 36px", color: "var(--text)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" }}
                  />
                  {searchQuery && <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 16 }}>×</button>}
                </div>

                <div className="cat-top" style={{ gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
                  {CATEGORIES.slice(0, 5).map(cat => (
                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ background: activeCategory === cat.id ? "var(--accent)" : "var(--surface)", border: `0.5px solid ${activeCategory === cat.id ? "var(--accent)" : "var(--border)"}`, borderRadius: 20, padding: "6px 14px", color: activeCategory === cat.id ? "#fff" : "var(--text2)", fontSize: 12, fontFamily: "var(--font-body)", fontWeight: activeCategory === cat.id ? 500 : 400, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Personalized toggle */}
                <button onClick={() => setPersonalized(p => !p)} title={personalized ? "Switch to latest" : "Switch to personalized"} style={{ background: personalized ? "rgba(59,158,255,0.1)" : "var(--surface)", border: `0.5px solid ${personalized ? "rgba(59,158,255,0.35)" : "var(--border)"}`, borderRadius: 8, padding: "7px 11px", color: personalized ? "var(--accent)" : "var(--text3)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {personalized ? "✦ For you" : "✦ For you"}
                </button>
              </>
            )}

            {activeTab !== "feed" && (
              <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--text)" }}>
                {activeTab === "sources" ? "Sources" : activeTab === "discover" ? "Discover" : "Settings"}
              </div>
            )}

            {/* Theme toggle — always visible */}
            <button onClick={toggleTheme} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 8, padding: "7px 10px", color: "var(--text2)", cursor: "pointer", fontSize: 14, marginLeft: "auto", flexShrink: 0 }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {activeTab === "feed" && (
              <div style={{ padding: "20px 24px 40px", maxWidth: 760, width: "100%" }}>

                {showBookmarks && (
                  <div style={{ padding: "10px 14px", marginBottom: 14, background: "rgba(251,191,36,0.05)", border: "0.5px solid rgba(251,191,36,0.15)", borderRadius: 8, fontSize: 12, color: "var(--amber)", fontFamily: "var(--font-mono)" }}>
                    ◆ Showing {bookmarks.size} saved item{bookmarks.size !== 1 ? "s" : ""}
                  </div>
                )}

                {personalized && !showBookmarks && (
                  <div style={{ padding: "8px 14px", marginBottom: 14, background: "rgba(59,158,255,0.05)", border: "0.5px solid rgba(59,158,255,0.15)", borderRadius: 8, fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                    ✦ Ranked by your feedback, source quality, and recency
                  </div>
                )}

                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner/></div>
                ) : filtered.length === 0 ? (
                  <EmptyState message="No items found — try a different category or add more sources"/>
                ) : (
                  <>
                    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text3)", marginBottom: 14 }}>
                      {pagination.total_count.toLocaleString()} articles · page {pagination.page} of {pagination.total_pages}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {filtered.map(item => (
                        <FeedCard key={item.id} item={item} onLike={handleLike} onBookmark={handleBookmark}/>
                      ))}
                    </div>
                    {pagination.page < pagination.total_pages && (
                      <div style={{ textAlign: "center", marginTop: 24 }}>
                        <button onClick={() => fetchFeed(pagination.page + 1, activeCategory, false)} disabled={loadingMore}
                          style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 8, padding: "10px 24px", color: "var(--text2)", fontSize: 13, fontFamily: "var(--font-body)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                          {loadingMore ? <><Spinner size={14}/> Loading…</> : `Load more (${pagination.total_count - feed.length} remaining)`}
                        </button>
                      </div>
                    )}
                    <div style={{ textAlign: "center", padding: "24px 0", fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>· {pagination.total_count.toLocaleString()} total articles ·</div>
                  </>
                )}
              </div>
            )}

            {activeTab === "sources"  && <SourcesTab/>}
            {activeTab === "discover" && <DiscoverTab user={user}/>}
            {activeTab === "settings" && <SettingsTab user={user} onLogout={handleLogout}/>}
          </div>
        </div>
      </div>
    </>
  );
}
