"use client";
import { User } from "@/app/types";
import { CATEGORIES } from "@/app/constants";

const NAV_ITEMS = [
  { id: "feed",     icon: "◈", label: "Feed"     },
  { id: "sources",  icon: "◉", label: "Sources"  },
  { id: "discover", icon: "⌕", label: "Discover" },
  { id: "settings", icon: "⊹", label: "Settings" },
];

interface Props {
  user: User;
  activeCategory: string;
  setActiveCategory: (v: string) => void;
  activeTab: string;
  setActiveTab: (v: string) => void;
  showBookmarks: boolean;
  setShowBookmarks: (v: boolean) => void;
  bookmarkCount: number;
  onClose?: () => void;
}

export default function Sidebar({
  user, activeCategory, setActiveCategory,
  activeTab, setActiveTab,
  showBookmarks, setShowBookmarks, bookmarkCount, onClose,
}: Props) {
  return (
    <div style={{ width: 240, background: "var(--bg2)", borderRight: "0.5px solid var(--border)", display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto", flexShrink: 0 }}>

      {/* Logo */}
      <div style={{ padding: "24px 20px 16px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 21, letterSpacing: "-0.03em", color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 10px var(--accent)", display: "inline-block", animation: "pulse 2s ease-in-out infinite" }}/>
          ThinkStream
        </div>
      </div>

      {/* User chip */}
      <div style={{ margin: "0 12px 16px", background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 9, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(59,158,255,0.15)", border: "0.5px solid rgba(59,158,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-display)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
          <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ padding: "0 12px", marginBottom: 20 }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); onClose?.(); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 9, border: "none", background: activeTab === item.id ? "rgba(59,158,255,0.1)" : "transparent", color: activeTab === item.id ? "var(--accent)" : "var(--text2)", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)", fontWeight: activeTab === item.id ? 500 : 400, transition: "all 0.15s", textAlign: "left", marginBottom: 2 }}>
            <span style={{ fontSize: 14, filter: activeTab === item.id ? "drop-shadow(0 0 4px var(--accent))" : "none" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Category filter (feed tab only) */}
      {activeTab === "feed" && (
        <>
          <div style={{ height: "0.5px", background: "var(--border)", margin: "0 20px 16px" }}/>
          <div style={{ padding: "0 12px", flex: 1 }}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text3)", letterSpacing: "0.08em", padding: "0 12px", marginBottom: 10 }}>CATEGORIES</div>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setActiveCategory(cat.id); onClose?.(); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, border: "none", background: activeCategory === cat.id ? "rgba(59,158,255,0.08)" : "transparent", color: activeCategory === cat.id ? "var(--accent)" : "var(--text2)", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)", fontWeight: activeCategory === cat.id ? 500 : 400, transition: "all 0.15s", textAlign: "left", marginBottom: 1, borderLeft: activeCategory === cat.id ? "2px solid var(--accent)" : "2px solid transparent" }}>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{cat.icon}</span>{cat.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Bookmarks toggle */}
      <div style={{ padding: "16px 20px", borderTop: "0.5px solid var(--border)", marginTop: "auto" }}>
        <button onClick={() => setShowBookmarks(!showBookmarks)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, border: "none", background: showBookmarks ? "rgba(251,191,36,0.08)" : "transparent", color: showBookmarks ? "var(--amber)" : "var(--text2)", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)", transition: "all 0.15s", textAlign: "left" }}>
          <span>{showBookmarks ? "◆" : "◇"}</span>Saved
          {bookmarkCount > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: "var(--font-mono)", background: "rgba(251,191,36,0.1)", color: "var(--amber)", borderRadius: 4, padding: "1px 6px" }}>{bookmarkCount}</span>
          )}
        </button>
      </div>
    </div>
  );
}
