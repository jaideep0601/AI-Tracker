"use client";
import { useState, useEffect } from "react";
import { User, Stats, TopSource } from "@/app/types";
import { API } from "@/app/constants";
import { loadLocal } from "@/app/helpers";
import { Spinner } from "@/components/ui/SharedUI";

export default function SettingsTab({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [name,       setName]       = useState(user.name);
  const [saved,      setSaved]      = useState(false);
  const [stats,      setStats]      = useState<Stats | null>(null);
  const [topSources, setTopSources] = useState<TopSource[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const searchHistory = loadLocal<string[]>(user.email, "search_history", []);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/analytics/stats`).then(r => r.json()),
      fetch(`${API}/api/analytics/top-sources?limit=5`).then(r => r.json()),
    ])
      .then(([s, t]) => { setStats(s); setTopSources(t.data || []); })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  function saveProfile() {
    const u = { ...user, name };
    localStorage.setItem("ts_user", JSON.stringify(u));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const sectionStyle: React.CSSProperties = {
    background: "var(--surface)", border: "0.5px solid var(--border)",
    borderRadius: 12, padding: 20, marginBottom: 16,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text3)",
    letterSpacing: "0.06em", marginBottom: 16,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--bg2)", border: "0.5px solid var(--border2)",
    borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13,
    fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box", marginBottom: 14,
  };

  return (
    <div style={{ padding: "24px", maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 4 }}>Settings</div>
      </div>

      {/* Profile */}
      <div style={sectionStyle}>
        <div style={labelStyle}>PROFILE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(59,158,255,0.15)", border: "0.5px solid rgba(59,158,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-display)" }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-display)" }}>{name}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{user.email}</div>
          </div>
        </div>
        <label style={{ ...labelStyle, display: "block" }}>DISPLAY NAME</label>
        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle}
          onFocus={e => e.currentTarget.style.borderColor = "rgba(59,158,255,0.4)"}
          onBlur={e  => e.currentTarget.style.borderColor = "var(--border2)"}/>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={saveProfile} style={{ background: "var(--accent)", border: "none", borderRadius: 8, padding: "9px 18px", color: "#fff", fontSize: 13, fontFamily: "var(--font-body)", cursor: "pointer" }}>Save changes</button>
          {saved && <span style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--font-mono)" }}>✓ Saved</span>}
        </div>
      </div>

      {/* Summary stats */}
      <div style={sectionStyle}>
        <div style={labelStyle}>FEED OVERVIEW</div>
        {statsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 20 }}><Spinner/></div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
              {[
                { label: "Articles",  value: stats?.total_articles ?? 0,   color: "var(--accent)" },
                { label: "Sources",   value: stats?.total_sources ?? 0,    color: "var(--green)"  },
                { label: "Searches",  value: searchHistory.length,          color: "var(--amber)"  },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--bg2)", border: "0.5px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)", color: s.color }}>{s.value.toLocaleString()}</div>
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text3)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Category breakdown */}
            {stats && Object.keys(stats.categories).length > 0 && (
              <>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text3)", letterSpacing: "0.06em", marginBottom: 10 }}>BY CATEGORY</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.entries(stats.categories)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => {
                      const total = stats.total_articles || 1;
                      const pct   = Math.round((count / total) * 100);
                      return (
                        <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 80, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text2)", textTransform: "capitalize" }}>{cat}</div>
                          <div style={{ flex: 1, height: 4, background: "var(--bg2)", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 2, transition: "width 0.6s ease" }}/>
                          </div>
                          <div style={{ width: 40, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text3)", textAlign: "right" }}>{count}</div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Top sources by engagement */}
      {topSources.length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>TOP SOURCES BY ENGAGEMENT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topSources.map((s, i) => (
              <div key={s.source_id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 20, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text3)", textAlign: "center" }}>#{i + 1}</div>
                <div style={{ flex: 1, fontSize: 12, fontFamily: "var(--font-display)", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.source_name}</div>
                <div style={{ display: "flex", gap: 10, fontSize: 11, fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                  <span style={{ color: "var(--green)" }}>↑{s.thumbs_up_count}</span>
                  <span style={{ color: "var(--red)" }}>↓{s.thumbs_down_count}</span>
                  <span style={{ color: "var(--text3)" }}>{Math.round(s.engagement_ratio * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sign out */}
      <div style={{ background: "rgba(255,77,77,0.04)", border: "0.5px solid rgba(255,77,77,0.15)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--red)", letterSpacing: "0.06em", marginBottom: 12 }}>ACCOUNT</div>
        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>Your preferences and bookmarks are saved locally.</div>
        <button onClick={onLogout} style={{ background: "rgba(255,77,77,0.1)", border: "0.5px solid rgba(255,77,77,0.3)", borderRadius: 8, padding: "9px 18px", color: "var(--red)", fontSize: 13, fontFamily: "var(--font-body)", cursor: "pointer" }}>Sign out</button>
      </div>
    </div>
  );
}
