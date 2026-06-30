"use client";
import { useState, useEffect } from "react";
import { Source } from "@/app/types";
import { API, SOURCE_TYPE_OPTIONS } from "@/app/constants";
import { getSourceColor } from "@/app/helpers";
import { Spinner, StarRating } from "@/components/ui/SharedUI";

export default function SourcesTab() {
  const [sources,    setSources]    = useState<Source[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showAdd,    setShowAdd]    = useState(false);
  const [fetchingId, setFetchingId] = useState<number | null>(null);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [msg,        setMsg]        = useState("");

  // Add-source form state
  const [form, setForm] = useState({ name: "", type: "rss", url: "", description: "", rating: 3 });
  const [addError, setAddError]   = useState("");
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => { loadSources(); }, []);

  async function loadSources() {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/sources`);
      const data = await res.json();
      setSources(Array.isArray(data) ? data : data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function updateRating(id: number, rating: number) {
    await fetch(`${API}/api/sources/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
    setSources(s => s.map(src => src.id === id ? { ...src, rating } : src));
  }

  async function toggleActive(id: number, active: boolean) {
    await fetch(`${API}/api/sources/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setSources(s => s.map(src => src.id === id ? { ...src, active } : src));
  }

  async function deleteSource(id: number) {
    if (!confirm("Remove this source and all its articles?")) return;
    await fetch(`${API}/api/sources/${id}`, { method: "DELETE" });
    setSources(s => s.filter(src => src.id !== id));
  }

  async function fetchSource(id: number) {
    setFetchingId(id);
    try {
      const res  = await fetch(`${API}/api/sources/${id}/fetch`, { method: "POST" });
      const data = await res.json();
      const inserted = data.inserted ?? 0;
      showMsg(inserted > 0 ? `✓ ${inserted} new article(s) fetched` : data.error ? `Error: ${data.error}` : "Nothing new");
    } catch { showMsg("Fetch failed"); }
    finally { setFetchingId(null); }
  }

  async function fetchAll() {
    setFetchingAll(true);
    try {
      const res  = await fetch(`${API}/api/sources/fetch-all`, { method: "POST" });
      const data = await res.json();
      showMsg(data.message || "Done");
    } catch { showMsg("Fetch all failed"); }
    finally { setFetchingAll(false); }
  }

  async function addSource() {
    if (!form.name.trim() || !form.url.trim()) { setAddError("Name and URL are required"); return; }
    setAddLoading(true); setAddError("");
    try {
      const res  = await fetch(`${API}/api/sources`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to add source");
      setSources(s => [data, ...s]);
      setForm({ name: "", type: "rss", url: "", description: "", rating: 3 });
      setShowAdd(false);
      showMsg("✓ Source added successfully");
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : "Failed to add");
    } finally { setAddLoading(false); }
  }

  function showMsg(text: string) { setMsg(text); setTimeout(() => setMsg(""), 4000); }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--bg2)", border: "0.5px solid var(--border2)",
    borderRadius: 8, padding: "9px 12px", color: "var(--text)", fontSize: 13,
    fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box",
  };

  if (loading) return <div style={{ padding: 40, display: "flex", justifyContent: "center" }}><Spinner/></div>;

  return (
    <div style={{ padding: "24px", maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 4 }}>Sources</div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>{sources.length} sources · rate to improve personalization</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={fetchAll} disabled={fetchingAll} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 8, padding: "8px 14px", color: "var(--text2)", fontSize: 12, fontFamily: "var(--font-mono)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {fetchingAll ? <><Spinner size={12}/> Fetching…</> : "↻ Refresh all"}
          </button>
          <button onClick={() => setShowAdd(!showAdd)} style={{ background: showAdd ? "var(--accent)" : "rgba(59,158,255,0.1)", border: "0.5px solid rgba(59,158,255,0.3)", borderRadius: 8, padding: "8px 14px", color: showAdd ? "#fff" : "var(--accent)", fontSize: 12, fontFamily: "var(--font-mono)", cursor: "pointer" }}>
            {showAdd ? "✕ Cancel" : "+ Add source"}
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: msg.startsWith("Error") ? "rgba(255,77,77,0.06)" : "rgba(52,211,153,0.06)", border: `0.5px solid ${msg.startsWith("Error") ? "rgba(255,77,77,0.2)" : "rgba(52,211,153,0.2)"}`, borderRadius: 8, fontSize: 12, fontFamily: "var(--font-mono)", color: msg.startsWith("Error") ? "var(--red)" : "var(--green)" }}>
          {msg}
        </div>
      )}

      {/* Add source form */}
      {showAdd && (
        <div style={{ background: "var(--surface)", border: "0.5px solid rgba(59,158,255,0.25)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 16 }}>Add New Source</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text3)", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>NAME</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Hugging Face Blog" style={inputStyle}/>
            </div>
            <div>
              <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text3)", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>TYPE</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inputStyle, appearance: "none" }}>
                {SOURCE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text3)", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>URL</label>
            <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://…" style={inputStyle}/>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text3)", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>DESCRIPTION (optional)</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" style={inputStyle}/>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text3)", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>INITIAL RATING</label>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setForm(f => ({ ...f, rating: i }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: i <= form.rating ? "var(--amber)" : "var(--text3)", padding: 0 }}>★</button>
              ))}
            </div>
          </div>
          {addError && <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 12, fontFamily: "var(--font-mono)" }}>{addError}</div>}
          <button onClick={addSource} disabled={addLoading} style={{ background: "var(--accent)", border: "none", borderRadius: 8, padding: "9px 20px", color: "#fff", fontSize: 13, fontFamily: "var(--font-body)", cursor: "pointer", opacity: addLoading ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6 }}>
            {addLoading ? <><Spinner size={13}/> Adding…</> : "Add source"}
          </button>
        </div>
      )}

      {/* Source list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sources.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)", fontSize: 13 }}>No sources yet. Add one above!</div>
        ) : sources.map(src => (
          <div key={src.id} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, opacity: src.active ? 1 : 0.45, transition: "all 0.2s" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: getSourceColor(src.type), boxShadow: `0 0 8px ${getSourceColor(src.type)}`, flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 2 }}>{src.name}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span>{src.type}</span>
                <span>·</span>
                <span>quality {src.quality_score}%</span>
                {src.fetch_error_count > 0 && <span style={{ color: "var(--red)" }}>· {src.fetch_error_count} error(s)</span>}
                {src.last_fetched_at && <span>· fetched {new Date(src.last_fetched_at).toLocaleDateString()}</span>}
              </div>
            </div>
            <StarRating stars={src.rating}/>
            <div style={{ display: "flex", gap: 3 }}>
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => updateRating(src.id, i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: i <= src.rating ? "var(--amber)" : "var(--text3)", padding: 0 }}>★</button>
              ))}
            </div>
            <button onClick={() => fetchSource(src.id)} disabled={fetchingId === src.id} title="Fetch now" style={{ background: "transparent", border: "0.5px solid var(--border)", borderRadius: 6, padding: "4px 8px", color: "var(--text3)", fontSize: 11, fontFamily: "var(--font-mono)", cursor: "pointer" }}>
              {fetchingId === src.id ? <Spinner size={12}/> : "↻"}
            </button>
            <button onClick={() => toggleActive(src.id, !src.active)} style={{ background: src.active ? "rgba(59,158,255,0.1)" : "var(--bg2)", border: `0.5px solid ${src.active ? "rgba(59,158,255,0.3)" : "var(--border)"}`, borderRadius: 20, padding: "4px 12px", color: src.active ? "var(--accent)" : "var(--text3)", fontSize: 11, fontFamily: "var(--font-mono)", cursor: "pointer", whiteSpace: "nowrap" }}>
              {src.active ? "Active" : "Paused"}
            </button>
            <button onClick={() => deleteSource(src.id)} title="Delete source" style={{ background: "transparent", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 14, padding: "4px", opacity: 0.5 }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
