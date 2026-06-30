"use client";
import { useState, useEffect } from "react";
import { FeedItem, User } from "@/app/types";
import { API } from "@/app/constants";
import { Spinner, SourceDot, Tag } from "@/components/ui/SharedUI";
import { saveLocal, loadLocal } from "@/app/helpers";

export default function DiscoverTab({ user }: { user: User }) {
  const [query,       setQuery]       = useState("");
  const [focused,     setFocused]     = useState(false);
  const [results,     setResults]     = useState<FeedItem[]>([]);
  const [searched,    setSearched]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [totalHits,   setTotalHits]   = useState(0);
  const [totalArticles, setTotalArticles] = useState<number | null>(null);
  const [history,     setHistory]     = useState<string[]>(() => loadLocal(user.email, "search_history", []));

  // Fetch real article count on mount
  useEffect(() => {
    fetch(`${API}/api/analytics/stats`)
      .then(r => r.json())
      .then(d => setTotalArticles(d.total_articles ?? null))
      .catch(() => {});
  }, []);

  async function doSearch(q: string) {
    if (!q.trim()) return;
    setQuery(q); setSearched(true); setLoading(true);
    try {
      const res  = await fetch(`${API}/api/feed/search?q=${encodeURIComponent(q)}&limit=20`);
      const data = await res.json();
      setResults(data.data || []);
      setTotalHits(data.total_hits ?? (data.data?.length ?? 0));
    } catch { setResults([]); setTotalHits(0); }
    finally { setLoading(false); }
    const next = [q, ...history.filter(h => h !== q)].slice(0, 20);
    setHistory(next);
    saveLocal(user.email, "search_history", next);
  }

  return (
    <div style={{ padding: "24px", maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 6 }}>Discover</div>
        <div style={{ fontSize: 13, color: "var(--text2)" }}>
          Search across {totalArticles !== null ? <strong style={{ color: "var(--accent)" }}>{totalArticles.toLocaleString()}</strong> : "…"} articles from your sources.
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontSize: 16, pointerEvents: "none" }}>⌕</span>
        <input
          placeholder="Search papers, models, tools…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && doSearch(query)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          style={{ width: "100%", background: "var(--surface)", border: `0.5px solid ${focused ? "rgba(59,158,255,0.4)" : "var(--border)"}`, borderRadius: 10, padding: "11px 90px 11px 40px", color: "var(--text)", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" }}
        />
        <button onClick={() => doSearch(query)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "var(--accent)", border: "none", borderRadius: 7, padding: "5px 12px", color: "#fff", fontSize: 12, fontFamily: "var(--font-mono)", cursor: "pointer" }}>Search</button>
      </div>

      {loading && <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner/></div>}

      {searched && !loading && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text3)", marginBottom: 12 }}>
            {totalHits} result{totalHits !== 1 ? "s" : ""} for &quot;{query}&quot;
          </div>
          {results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)", fontSize: 13 }}>No results found</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {results.map(item => (
                <div key={item.id} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <SourceDot source={item.source}/>
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)", textDecoration: "none" }}>↗ open</a>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5, marginBottom: 8 }}>{item.content?.slice(0, 160)}…</div>
                  <div style={{ display: "flex", gap: 4 }}><Tag label={item.category}/><Tag label={item.source.type}/></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {history.length > 0 && !loading && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text3)", letterSpacing: "0.08em" }}>RECENT SEARCHES</div>
            <button onClick={() => { setHistory([]); saveLocal(user.email, "search_history", []); }} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 11, fontFamily: "var(--font-mono)", cursor: "pointer" }}>Clear</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {history.map((h, i) => (
              <button key={i} onClick={() => doSearch(h)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.color = "var(--text2)"; }}
                style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 20, padding: "6px 14px", color: "var(--text2)", fontSize: 12, fontFamily: "var(--font-mono)", cursor: "pointer" }}>
                ⌕ {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {!searched && history.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)" }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.2 }}>⌕</div>
          <div style={{ fontSize: 13 }}>Search anything — history saves automatically</div>
        </div>
      )}
    </div>
  );
}
