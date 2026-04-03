"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type User = { email: string; name: string };
type Source = { id: number; name: string; type: string; rating: number; quality_score: number };
type FeedItem = {
  id: number; category: string; source: Source; title: string;
  content: string; url: string; author: string; published_at: string;
  liked: boolean | null; bookmarked: boolean;
};
type Pagination = { page: number; limit: number; total_count: number; total_pages: number };

// ─── Constants ────────────────────────────────────────────────────────────────
const API = "http://localhost:8000";

const categories = [
  { id: "all",       label: "All",       icon: "◈" },
  { id: "research",  label: "Research",  icon: "⬡" },
  { id: "models",    label: "Models",    icon: "◉" },
  { id: "development", label: "Development", icon: "◫" },
  { id: "social",    label: "Social",    icon: "◎" },
  { id: "companies", label: "Companies", icon: "◪" },
  { id: "events",    label: "Events",    icon: "◷" },
];

const SOURCE_COLORS: Record<string, string> = {
  reddit: "#FF4500", arxiv: "#B5451B", github: "#238636",
  blog: "#10A37F", twitter: "#E7E9EA", linkedin: "#0A66C2",
  youtube: "#FF0000", newsletter: "#7C3AED", default: "#3B9EFF",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSourceColor(type: string) { return SOURCE_COLORS[type] || SOURCE_COLORS.default; }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

function saveLocal(email: string, key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`ts_${email}_${key}`, JSON.stringify(value));
}
function loadLocal<T>(email: string, key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const r = localStorage.getItem(`ts_${email}_${key}`); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}

// ─── Small components ─────────────────────────────────────────────────────────
function SourceDot({ source }: { source: Source }) {
  const color = getSourceColor(source.type);
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontFamily:"var(--font-mono)", color:"var(--text2)" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:color, boxShadow:`0 0 5px ${color}`, flexShrink:0 }}/>
      {source.name}
    </span>
  );
}

function StarRating({ stars }: { stars: number }) {
  return <span style={{ display:"flex", gap:1 }}>{[1,2,3,4,5].map(i=><span key={i} style={{ fontSize:9, color:i<=stars?"var(--amber)":"var(--text3)" }}>★</span>)}</span>;
}

function Tag({ label }: { label: string }) {
  return <span style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--accent)", background:"rgba(59,158,255,0.08)", border:"0.5px solid rgba(59,158,255,0.2)", borderRadius:4, padding:"2px 7px", whiteSpace:"nowrap" }}>{label}</span>;
}

function Spinner() {
  return <div style={{ width:20, height:20, border:"2px solid var(--border)", borderTop:"2px solid var(--accent)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>;
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [step,    setStep]    = useState<"email"|"otp">("email");
  const [email,   setEmail]   = useState("");
  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [info,    setInfo]    = useState("");

  const sendOtp = async () => {
    if (!email.includes("@")) { setError("Enter a valid email"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/auth/send-otp`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send OTP");
      setStep("otp");
      setInfo(
        data.delivery === "console"
          ? `Code generated for ${email}. Check the backend console in development.`
          : `Code sent to ${email}`
      );
    } catch(e: unknown) { setError(e instanceof Error ? e.message : "Error sending OTP"); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (otp.length < 4) { setError("Enter the 6-digit code"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email, otp }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid OTP");
      const user: User = { email, name: data.name || email.split("@")[0] };
      localStorage.setItem("ts_user", JSON.stringify(user));
      onLogin(user);
    } catch(e: unknown) { setError(e instanceof Error ? e.message : "Verification failed"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ position:"fixed", top:"20%", left:"50%", transform:"translateX(-50%)", width:500, height:300, background:"radial-gradient(ellipse, rgba(59,158,255,0.06) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, fontFamily:"var(--font-display)", fontWeight:800, fontSize:28, letterSpacing:"-0.03em", color:"var(--text)" }}>
            <span style={{ width:10, height:10, borderRadius:"50%", background:"var(--accent)", boxShadow:"0 0 12px var(--accent)", display:"inline-block", animation:"pulse 2s ease-in-out infinite" }}/>
            ThinkStream
          </div>
          <div style={{ fontSize:13, color:"var(--text3)", fontFamily:"var(--font-mono)", marginTop:8 }}>your personal AI intelligence feed</div>
        </div>

        <div style={{ background:"var(--surface)", border:"0.5px solid var(--border)", borderRadius:16, padding:28 }}>
          {step === "email" ? (<>
            <div style={{ fontSize:16, fontWeight:600, fontFamily:"var(--font-display)", color:"var(--text)", marginBottom:6 }}>Sign in</div>
            <div style={{ fontSize:13, color:"var(--text2)", marginBottom:24 }}>We&apos;ll send a verification code to your email</div>
            <label style={{ fontSize:11, fontFamily:"var(--font-mono)", color:"var(--text3)", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>EMAIL ADDRESS</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e=>{setEmail(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&sendOtp()}
              style={{ width:"100%", background:"var(--bg2)", border:"0.5px solid var(--border2)", borderRadius:9, padding:"11px 14px", color:"var(--text)", fontSize:14, fontFamily:"var(--font-body)", outline:"none", marginBottom:16, boxSizing:"border-box" }}
              onFocus={e=>e.currentTarget.style.borderColor="rgba(59,158,255,0.5)"} onBlur={e=>e.currentTarget.style.borderColor="var(--border2)"}/>
            {error && <div style={{ fontSize:12, color:"var(--red)", marginBottom:12, fontFamily:"var(--font-mono)" }}>{error}</div>}
            <button onClick={sendOtp} disabled={loading} style={{ width:"100%", background:"var(--accent)", border:"none", borderRadius:9, padding:"11px 0", color:"#fff", fontSize:14, fontFamily:"var(--font-body)", cursor:"pointer", opacity:loading?0.7:1 }}>
              {loading ? "Sending…" : "Send verification code →"}
            </button>
          </>) : (<>
            <button onClick={()=>{setStep("email");setOtp("");setError("");}} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:12, fontFamily:"var(--font-mono)", marginBottom:20, padding:0 }}>← back</button>
            <div style={{ fontSize:16, fontWeight:600, fontFamily:"var(--font-display)", color:"var(--text)", marginBottom:12 }}>Check your inbox</div>
            {info && <div style={{ fontSize:12, color:"var(--green)", marginBottom:16, fontFamily:"var(--font-mono)", background:"rgba(52,211,153,0.08)", border:"0.5px solid rgba(52,211,153,0.2)", borderRadius:6, padding:"8px 12px" }}>{info}</div>}
            <label style={{ fontSize:11, fontFamily:"var(--font-mono)", color:"var(--text3)", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>6-DIGIT CODE</label>
            <input type="text" placeholder="000000" value={otp} maxLength={6} onChange={e=>{setOtp(e.target.value.replace(/\D/,""));setError("");}} onKeyDown={e=>e.key==="Enter"&&verifyOtp()} autoFocus
              style={{ width:"100%", background:"var(--bg2)", border:"0.5px solid var(--border2)", borderRadius:9, padding:"11px 14px", color:"var(--text)", fontSize:28, fontFamily:"var(--font-mono)", outline:"none", marginBottom:16, letterSpacing:"0.3em", textAlign:"center", boxSizing:"border-box" }}
              onFocus={e=>e.currentTarget.style.borderColor="rgba(59,158,255,0.5)"} onBlur={e=>e.currentTarget.style.borderColor="var(--border2)"}/>
            {error && <div style={{ fontSize:12, color:"var(--red)", marginBottom:12, fontFamily:"var(--font-mono)" }}>{error}</div>}
            <button onClick={verifyOtp} disabled={loading} style={{ width:"100%", background:"var(--accent)", border:"none", borderRadius:9, padding:"11px 0", color:"#fff", fontSize:14, fontFamily:"var(--font-body)", cursor:"pointer", opacity:loading?0.7:1 }}>
              {loading ? "Verifying…" : "Verify & sign in →"}
            </button>
            <button onClick={sendOtp} style={{ width:"100%", background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:12, fontFamily:"var(--font-mono)", marginTop:14, padding:0 }}>Didn&apos;t receive it? Resend code</button>
          </>)}
        </div>
        <div style={{ textAlign:"center", fontSize:11, color:"var(--text3)", fontFamily:"var(--font-mono)", marginTop:20 }}>no password · no tracking · just your feed</div>
      </div>
    </div>
  );
}

// ─── FEED CARD ────────────────────────────────────────────────────────────────
function FeedCard({ item, onLike, onBookmark }: { item: FeedItem; onLike:(id:number,v:boolean)=>void; onBookmark:(id:number)=>void }) {
  const [expanded, setExpanded] = useState(false);
  const summary = item.content?.slice(0, 300) || "";

  return (
    <div onClick={()=>setExpanded(!expanded)}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.background="var(--surface2)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.background="var(--surface)";}}
      style={{ background:"var(--surface)", border:"0.5px solid var(--border)", borderRadius:12, padding:"16px 18px", cursor:"pointer", transition:"all 0.2s", position:"relative", overflow:"hidden" }}>

      <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:item.liked===true?"linear-gradient(90deg,transparent,var(--green),transparent)":item.liked===false?"linear-gradient(90deg,transparent,var(--red),transparent)":"linear-gradient(90deg,transparent,var(--border2),transparent)", opacity:0.6 }}/>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <SourceDot source={item.source}/>
          <StarRating stars={item.source.rating}/>
        </div>
        <span style={{ fontSize:11, color:"var(--text3)", fontFamily:"var(--font-mono)" }}>{timeAgo(item.published_at)}</span>
      </div>

      <div style={{ fontSize:14, fontWeight:600, fontFamily:"var(--font-display)", color:"var(--text)", lineHeight:1.4, marginBottom:8 }}>{item.title}</div>

      <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6, marginBottom:12, display:expanded?"block":"-webkit-box", WebkitLineClamp:expanded?undefined:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
        {expanded ? item.content : summary}
        {expanded && item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ display:"block", marginTop:8, color:"var(--accent)", fontSize:12, fontFamily:"var(--font-mono)" }}>
            Read full article ↗
          </a>
        )}
      </div>

      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 }}>
        <Tag label={item.category}/>
        <Tag label={item.source.type}/>
        {item.author && <Tag label={`@${item.author.slice(0,15)}`}/>}
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"0.5px solid var(--border)", paddingTop:10 }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={()=>onLike(item.id,true)}  style={{ background:item.liked===true?"rgba(52,211,153,0.12)":"transparent", border:`0.5px solid ${item.liked===true?"rgba(52,211,153,0.3)":"var(--border)"}`, borderRadius:6, padding:"5px 10px", color:item.liked===true?"var(--green)":"var(--text3)", cursor:"pointer", fontSize:13, fontFamily:"var(--font-body)" }}>↑</button>
          <button onClick={()=>onLike(item.id,false)} style={{ background:item.liked===false?"rgba(255,77,77,0.10)":"transparent", border:`0.5px solid ${item.liked===false?"rgba(255,77,77,0.25)":"var(--border)"}`, borderRadius:6, padding:"5px 10px", color:item.liked===false?"var(--red)":"var(--text3)", cursor:"pointer", fontSize:13, fontFamily:"var(--font-body)" }}>↓</button>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={()=>onBookmark(item.id)} style={{ background:"transparent", border:"none", color:item.bookmarked?"var(--amber)":"var(--text3)", cursor:"pointer", fontSize:14, padding:"4px 6px" }}>{item.bookmarked?"◆":"◇"}</button>
          {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{ background:"transparent", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:12, fontFamily:"var(--font-mono)", padding:"4px 6px", textDecoration:"none" }}>↗</a>}
        </div>
      </div>
    </div>
  );
}

// ─── SOURCES TAB ─────────────────────────────────────────────────────────────
function SourcesTab() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/sources`).then(r=>r.json()).then(d=>{ setSources(d.data||d||[]); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  async function updateRating(id: number, rating: number) {
    await fetch(`${API}/api/sources/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ rating }) });
    setSources(s => s.map(src => src.id===id ? {...src, rating} : src));
  }

  async function toggleActive(id: number, active: boolean) {
    await fetch(`${API}/api/sources/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ active }) });
    setSources(s => s.map(src => src.id===id ? {...src, active} : src));
  }

  if (loading) return <div style={{ padding:40, display:"flex", justifyContent:"center" }}><Spinner/></div>;

  return (
    <div style={{ padding:"24px", maxWidth:720 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:20, fontWeight:700, fontFamily:"var(--font-display)", color:"var(--text)", marginBottom:6 }}>Sources</div>
        <div style={{ fontSize:13, color:"var(--text2)" }}>{sources.length} active sources · rate them to improve your feed</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {sources.map((src: any) => (
          <div key={src.id} style={{ background:"var(--surface)", border:"0.5px solid var(--border)", borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", gap:14, opacity:src.active?1:0.45, transition:"all 0.2s" }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:getSourceColor(src.type), boxShadow:`0 0 8px ${getSourceColor(src.type)}`, flexShrink:0 }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, fontFamily:"var(--font-display)", color:"var(--text)", marginBottom:2 }}>{src.name}</div>
              <div style={{ fontSize:11, color:"var(--text3)", fontFamily:"var(--font-mono)" }}>{src.type} · quality {src.quality_score}%</div>
            </div>
            <div style={{ display:"flex", gap:3 }}>
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={()=>updateRating(src.id,i)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:i<=src.rating?"var(--amber)":"var(--text3)", padding:0 }}>★</button>
              ))}
            </div>
            <button onClick={()=>toggleActive(src.id,!src.active)} style={{ background:src.active?"rgba(59,158,255,0.1)":"var(--bg2)", border:`0.5px solid ${src.active?"rgba(59,158,255,0.3)":"var(--border)"}`, borderRadius:20, padding:"4px 12px", color:src.active?"var(--accent)":"var(--text3)", fontSize:11, fontFamily:"var(--font-mono)", cursor:"pointer", whiteSpace:"nowrap" }}>
              {src.active ? "Active" : "Paused"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DISCOVER TAB ─────────────────────────────────────────────────────────────
function DiscoverTab({ user }: { user: User }) {
  const [query,    setQuery]    = useState("");
  const [focused,  setFocused]  = useState(false);
  const [results,  setResults]  = useState<FeedItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [history,  setHistory]  = useState<string[]>(() => loadLocal(user.email, "search_history", []));

  async function doSearch(q: string) {
    if (!q.trim()) return;
    setQuery(q); setSearched(true); setLoading(true);
    try {
      const res = await fetch(`${API}/api/feed/search?q=${encodeURIComponent(q)}&limit=20`);
      const data = await res.json();
      setResults(data.data || data.results || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
    const next = [q, ...history.filter(h=>h!==q)].slice(0,20);
    setHistory(next); saveLocal(user.email, "search_history", next);
  }

  return (
    <div style={{ padding:"24px", maxWidth:720 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:20, fontWeight:700, fontFamily:"var(--font-display)", color:"var(--text)", marginBottom:6 }}>Discover</div>
        <div style={{ fontSize:13, color:"var(--text2)" }}>Search across {127} real AI articles from your sources.</div>
      </div>

      <div style={{ position:"relative", marginBottom:20 }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", fontSize:16, pointerEvents:"none" }}>⌕</span>
        <input placeholder="Search papers, models, tools…" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch(query)} onFocus={()=>setFocused(true)} onBlur={()=>setTimeout(()=>setFocused(false),150)}
          style={{ width:"100%", background:"var(--surface)", border:`0.5px solid ${focused?"rgba(59,158,255,0.4)":"var(--border)"}`, borderRadius:10, padding:"11px 46px 11px 40px", color:"var(--text)", fontSize:14, fontFamily:"var(--font-body)", outline:"none", boxSizing:"border-box" }}/>
        <button onClick={()=>doSearch(query)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"var(--accent)", border:"none", borderRadius:7, padding:"5px 12px", color:"#fff", fontSize:12, fontFamily:"var(--font-mono)", cursor:"pointer" }}>Search</button>
      </div>

      {loading && <div style={{ display:"flex", justifyContent:"center", padding:40 }}><Spinner/></div>}

      {searched && !loading && (
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11, fontFamily:"var(--font-mono)", color:"var(--text3)", marginBottom:12 }}>{results.length} results for &quot;{query}&quot;</div>
          {results.length===0
            ? <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text3)", fontSize:13 }}>No results found</div>
            : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {results.map(item=>(
                  <div key={item.id} style={{ background:"var(--surface)", border:"0.5px solid var(--border)", borderRadius:10, padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}><SourceDot source={item.source}/></div>
                    <div style={{ fontSize:13, fontWeight:600, fontFamily:"var(--font-display)", color:"var(--text)", marginBottom:4 }}>{item.title}</div>
                    <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.5, marginBottom:8 }}>{item.content?.slice(0,120)}…</div>
                    <div style={{ display:"flex", gap:4 }}><Tag label={item.category}/><Tag label={item.source.type}/></div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {history.length > 0 && !loading && (
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--text3)", letterSpacing:"0.08em" }}>RECENT SEARCHES</div>
            <button onClick={()=>{ setHistory([]); saveLocal(user.email,"search_history",[]); }} style={{ background:"none", border:"none", color:"var(--text3)", fontSize:11, fontFamily:"var(--font-mono)", cursor:"pointer" }}>Clear</button>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {history.map((h,i)=>(
              <button key={i} onClick={()=>doSearch(h)}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border2)";e.currentTarget.style.color="var(--text)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text2)";}}
                style={{ background:"var(--surface)", border:"0.5px solid var(--border)", borderRadius:20, padding:"6px 14px", color:"var(--text2)", fontSize:12, fontFamily:"var(--font-mono)", cursor:"pointer" }}>
                ⌕ {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {!searched && history.length===0 && (
        <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text3)" }}>
          <div style={{ fontSize:36, marginBottom:12, opacity:0.2 }}>⌕</div>
          <div style={{ fontSize:13 }}>Search anything — history saves automatically</div>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ user, onLogout }: { user: User; onLogout:()=>void }) {
  const [name,  setName]  = useState(user.name);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ total_articles: 0, total_sources: 0 });

  useEffect(() => {
    fetch(`${API}/api/analytics/stats`).then(r=>r.json()).then(d=>setStats(d)).catch(()=>{});
  }, []);

  function saveProfile() {
    const u = {...user, name};
    localStorage.setItem("ts_user", JSON.stringify(u));
    setSaved(true); setTimeout(()=>setSaved(false), 2000);
  }

  const searchHistory = loadLocal<string[]>(user.email, "search_history", []);

  return (
    <div style={{ padding:"24px", maxWidth:600 }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:20, fontWeight:700, fontFamily:"var(--font-display)", color:"var(--text)", marginBottom:6 }}>Settings</div>
      </div>

      <div style={{ background:"var(--surface)", border:"0.5px solid var(--border)", borderRadius:12, padding:20, marginBottom:16 }}>
        <div style={{ fontSize:11, fontFamily:"var(--font-mono)", color:"var(--text3)", letterSpacing:"0.06em", marginBottom:16 }}>PROFILE</div>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(59,158,255,0.15)", border:"0.5px solid rgba(59,158,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"var(--accent)", fontFamily:"var(--font-display)" }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", fontFamily:"var(--font-display)" }}>{name}</div>
            <div style={{ fontSize:12, color:"var(--text3)", fontFamily:"var(--font-mono)", marginTop:2 }}>{user.email}</div>
          </div>
        </div>
        <label style={{ fontSize:11, fontFamily:"var(--font-mono)", color:"var(--text3)", letterSpacing:"0.06em", display:"block", marginBottom:8 }}>DISPLAY NAME</label>
        <input value={name} onChange={e=>setName(e.target.value)}
          style={{ width:"100%", background:"var(--bg2)", border:"0.5px solid var(--border2)", borderRadius:8, padding:"9px 12px", color:"var(--text)", fontSize:13, fontFamily:"var(--font-body)", outline:"none", boxSizing:"border-box", marginBottom:14 }}
          onFocus={e=>e.currentTarget.style.borderColor="rgba(59,158,255,0.4)"} onBlur={e=>e.currentTarget.style.borderColor="var(--border2)"}/>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={saveProfile} style={{ background:"var(--accent)", border:"none", borderRadius:8, padding:"9px 18px", color:"#fff", fontSize:13, fontFamily:"var(--font-body)", cursor:"pointer" }}>Save changes</button>
          {saved && <span style={{ fontSize:12, color:"var(--green)", fontFamily:"var(--font-mono)" }}>✓ Saved</span>}
        </div>
      </div>

      <div style={{ background:"var(--surface)", border:"0.5px solid var(--border)", borderRadius:12, padding:20, marginBottom:16 }}>
        <div style={{ fontSize:11, fontFamily:"var(--font-mono)", color:"var(--text3)", letterSpacing:"0.06em", marginBottom:16 }}>FEED STATS</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[
            { label:"Articles",  value: stats.total_articles, color:"var(--accent)" },
            { label:"Sources",   value: stats.total_sources,  color:"var(--green)"  },
            { label:"Searches",  value: searchHistory.length, color:"var(--amber)" },
          ].map(s=>(
            <div key={s.label} style={{ background:"var(--bg2)", border:"0.5px solid var(--border)", borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:"var(--font-display)", color:s.color }}>{s.value}</div>
              <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--text3)", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:"rgba(255,77,77,0.04)", border:"0.5px solid rgba(255,77,77,0.15)", borderRadius:12, padding:20 }}>
        <div style={{ fontSize:11, fontFamily:"var(--font-mono)", color:"var(--red)", letterSpacing:"0.06em", marginBottom:12 }}>ACCOUNT</div>
        <div style={{ fontSize:13, color:"var(--text2)", marginBottom:16 }}>Your data stays saved locally for next time.</div>
        <button onClick={onLogout} style={{ background:"rgba(255,77,77,0.1)", border:"0.5px solid rgba(255,77,77,0.3)", borderRadius:8, padding:"9px 18px", color:"var(--red)", fontSize:13, fontFamily:"var(--font-body)", cursor:"pointer" }}>Sign out</button>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ user, activeCategory, setActiveCategory, activeTab, setActiveTab, showBookmarks, setShowBookmarks, bookmarkCount, onClose }: {
  user: User; activeCategory: string; setActiveCategory:(v:string)=>void;
  activeTab: string; setActiveTab:(v:string)=>void;
  showBookmarks: boolean; setShowBookmarks:(v:boolean)=>void;
  bookmarkCount: number; onClose?: ()=>void;
}) {
  const navItems = [
    { id:"feed",     icon:"◈", label:"Feed"     },
    { id:"sources",  icon:"◉", label:"Sources"  },
    { id:"discover", icon:"⌕", label:"Discover" },
    { id:"settings", icon:"⊹", label:"Settings" },
  ];
  return (
    <div style={{ width:240, background:"var(--bg2)", borderRight:"0.5px solid var(--border)", display:"flex", flexDirection:"column", height:"100vh", overflowY:"auto", flexShrink:0 }}>
      <div style={{ padding:"24px 20px 16px" }}>
        <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:21, letterSpacing:"-0.03em", color:"var(--text)", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ width:9, height:9, borderRadius:"50%", background:"var(--accent)", boxShadow:"0 0 10px var(--accent)", display:"inline-block", animation:"pulse 2s ease-in-out infinite" }}/>
          ThinkStream
        </div>
      </div>

      <div style={{ margin:"0 12px 16px", background:"var(--surface)", border:"0.5px solid var(--border)", borderRadius:9, padding:"10px 12px", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(59,158,255,0.15)", border:"0.5px solid rgba(59,158,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"var(--accent)", flexShrink:0 }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:600, color:"var(--text)", fontFamily:"var(--font-display)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div>
          <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"var(--font-mono)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</div>
        </div>
      </div>

      <div style={{ padding:"0 12px", marginBottom:20 }}>
        {navItems.map(item=>(
          <button key={item.id} onClick={()=>{ setActiveTab(item.id); onClose?.(); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:9, border:"none", background:activeTab===item.id?"rgba(59,158,255,0.1)":"transparent", color:activeTab===item.id?"var(--accent)":"var(--text2)", cursor:"pointer", fontSize:13, fontFamily:"var(--font-body)", fontWeight:activeTab===item.id?500:400, transition:"all 0.15s", textAlign:"left", marginBottom:2 }}>
            <span style={{ fontSize:14, filter:activeTab===item.id?"drop-shadow(0 0 4px var(--accent))":"none" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {activeTab==="feed" && <>
        <div style={{ height:"0.5px", background:"var(--border)", margin:"0 20px 16px" }}/>
        <div style={{ padding:"0 12px", flex:1 }}>
          <div style={{ fontSize:10, fontFamily:"var(--font-mono)", color:"var(--text3)", letterSpacing:"0.08em", padding:"0 12px", marginBottom:10 }}>CATEGORIES</div>
          {categories.map(cat=>(
            <button key={cat.id} onClick={()=>{ setActiveCategory(cat.id); onClose?.(); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, border:"none", background:activeCategory===cat.id?"rgba(59,158,255,0.08)":"transparent", color:activeCategory===cat.id?"var(--accent)":"var(--text2)", cursor:"pointer", fontSize:13, fontFamily:"var(--font-body)", fontWeight:activeCategory===cat.id?500:400, transition:"all 0.15s", textAlign:"left", marginBottom:1, borderLeft:activeCategory===cat.id?"2px solid var(--accent)":"2px solid transparent" }}>
              <span style={{ fontSize:11, opacity:0.7 }}>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>
      </>}

      <div style={{ padding:"16px 20px", borderTop:"0.5px solid var(--border)", marginTop:"auto" }}>
        <button onClick={()=>setShowBookmarks(!showBookmarks)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, border:"none", background:showBookmarks?"rgba(251,191,36,0.08)":"transparent", color:showBookmarks?"var(--amber)":"var(--text2)", cursor:"pointer", fontSize:13, fontFamily:"var(--font-body)", transition:"all 0.15s", textAlign:"left" }}>
          <span>{showBookmarks?"◆":"◇"}</span>Saved
          {bookmarkCount>0 && <span style={{ marginLeft:"auto", fontSize:10, fontFamily:"var(--font-mono)", background:"rgba(251,191,36,0.1)", color:"var(--amber)", borderRadius:4, padding:"1px 6px" }}>{bookmarkCount}</span>}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,           setUser]           = useState<User|null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [feed,           setFeed]           = useState<FeedItem[]>([]);
  const [pagination,     setPagination]     = useState<Pagination>({ page:1, limit:20, total_count:0, total_pages:1 });
  const [loading,        setLoading]        = useState(false);
  const [loadingMore,    setLoadingMore]    = useState(false);
  const [activeTab,      setActiveTab]      = useState("feed");
  const [showBookmarks,  setShowBookmarks]  = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [theme,          setTheme]          = useState<"dark"|"light">("dark");
  const [bookmarks,      setBookmarks]      = useState<Set<number>>(new Set());
  const [likes,          setLikes]          = useState<Map<number,boolean>>(new Map());
  const bookmarksRef = useRef(bookmarks);
  const likesRef = useRef(likes);

  useEffect(() => {
    const saved = localStorage.getItem("ts_theme") as "dark"|"light" || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("ts_theme", next);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { const r = localStorage.getItem("ts_user"); if (r) setUser(JSON.parse(r)); } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    setBookmarks(new Set(loadLocal<number[]>(user.email, "bookmarks", [])));
    setLikes(new Map(loadLocal<[number, boolean][]>(user.email, "likes", [])));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    saveLocal(user.email, "bookmarks", Array.from(bookmarks));
  }, [user, bookmarks]);

  useEffect(() => {
    if (!user) return;
    saveLocal(user.email, "likes", Array.from(likes.entries()));
  }, [user, likes]);

  useEffect(() => {
    bookmarksRef.current = bookmarks;
  }, [bookmarks]);

  useEffect(() => {
    likesRef.current = likes;
  }, [likes]);

  const fetchFeed = useCallback(async (page=1, category="all", replace=true) => {
    if (page===1) setLoading(true); else setLoadingMore(true);
    try {
      const catParam = category!=="all" ? `&category=${category}` : "";
      const res = await fetch(`${API}/api/feed?page=${page}&limit=20${catParam}`);
      const data = await res.json();
      const items: FeedItem[] = (data.data||[]).map((item: FeedItem) => ({
        ...item,
        liked: likesRef.current.get(item.id) ?? null,
        bookmarked: bookmarksRef.current.has(item.id),
      }));
      setFeed(prev => replace ? items : [...prev, ...items]);
      setPagination(data.pagination || { page, limit:20, total_count:items.length, total_pages:1 });
    } catch(e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { if (user) fetchFeed(1, activeCategory, true); }, [user, activeCategory, fetchFeed]);

  function handleLike(id: number, liked: boolean) {
    setLikes(m => {
      const n = new Map(m);
      if (m.get(id) === liked) n.delete(id);
      else n.set(id, liked);
      return n;
    });
    setFeed(f => f.map(i => i.id===id ? {...i, liked: i.liked===liked ? null : liked} : i));
  }

  function handleBookmark(id: number) {
    setBookmarks(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setFeed(f => f.map(i => i.id===id ? {...i, bookmarked: !i.bookmarked} : i));
  }

  function handleLogout() { localStorage.removeItem("ts_user"); setUser(null); }

  const filtered = showBookmarks ? feed.filter(i=>i.bookmarked) :
    searchQuery ? feed.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.content?.toLowerCase().includes(searchQuery.toLowerCase())) :
    feed;

  if (!user) return <LoginScreen onLogin={u=>setUser(u)}/>;

  return (
    <>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 8px var(--accent)}50%{opacity:.6;box-shadow:0 0 4px var(--accent)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .sb{display:flex!important}
        .mob-btn{display:none!important}
        .cat-top{display:flex!important}
        @media(max-width:768px){.sb{display:none!important}.mob-btn{display:flex!important}.cat-top{display:none!important}}
      `}</style>

      <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg)" }}>

        <div className="sb" style={{ position:"sticky", top:0, height:"100vh" }}>
          <Sidebar user={user} activeCategory={activeCategory} setActiveCategory={setActiveCategory} activeTab={activeTab} setActiveTab={setActiveTab} showBookmarks={showBookmarks} setShowBookmarks={setShowBookmarks} bookmarkCount={bookmarks.size}/>
        </div>

        {mobileOpen && (
          <div style={{ position:"fixed", inset:0, zIndex:200 }}>
            <div onClick={()=>setMobileOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)" }}/>
            <div style={{ position:"absolute", left:0, top:0, bottom:0, zIndex:201 }}>
              <Sidebar user={user} activeCategory={activeCategory} setActiveCategory={setActiveCategory} activeTab={activeTab} setActiveTab={setActiveTab} showBookmarks={showBookmarks} setShowBookmarks={setShowBookmarks} bookmarkCount={bookmarks.size} onClose={()=>setMobileOpen(false)}/>
            </div>
          </div>
        )}

        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
          <div style={{ position:"sticky", top:0, zIndex:40, background:"rgba(8,11,15,0.92)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:"0.5px solid var(--border)", padding:"12px 20px", display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={toggleTheme} style={{ background:"var(--surface)", border:"0.5px solid var(--border)", borderRadius:8, padding:"7px 10px", color:"var(--text2)", cursor:"pointer", fontSize:14, marginLeft:"auto" }}>{theme === "dark" ? "??" : "??"}</button>
            <button className="mob-btn" onClick={()=>setMobileOpen(true)} style={{ background:"var(--surface)", border:"0.5px solid var(--border)", borderRadius:8, padding:"7px 12px", color:"var(--text2)", cursor:"pointer", fontSize:15 }}>☰</button>

            {activeTab==="feed" && <>
              <div style={{ flex:1, position:"relative", maxWidth:520 }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", fontSize:14, pointerEvents:"none" }}>⌕</span>
                <input placeholder="Filter feed…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)}
                  style={{ width:"100%", background:"var(--surface)", border:`0.5px solid ${searchFocused?"rgba(59,158,255,0.4)":"var(--border)"}`, borderRadius:10, padding:"9px 12px 9px 36px", color:"var(--text)", fontSize:13, fontFamily:"var(--font-body)", outline:"none", boxSizing:"border-box" }}/>
                {searchQuery && <button onClick={()=>setSearchQuery("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:16 }}>×</button>}
              </div>
              <div className="cat-top" style={{ gap:6, overflowX:"auto", scrollbarWidth:"none" }}>
                {categories.slice(0,5).map(cat=>(
                  <button key={cat.id} onClick={()=>setActiveCategory(cat.id)} style={{ background:activeCategory===cat.id?"var(--accent)":"var(--surface)", border:`0.5px solid ${activeCategory===cat.id?"var(--accent)":"var(--border)"}`, borderRadius:20, padding:"6px 14px", color:activeCategory===cat.id?"#fff":"var(--text2)", fontSize:12, fontFamily:"var(--font-body)", fontWeight:activeCategory===cat.id?500:400, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s" }}>{cat.label}</button>
                ))}
              </div>
            </>}

            {activeTab!=="feed" && <div style={{ fontSize:15, fontWeight:600, fontFamily:"var(--font-display)", color:"var(--text)" }}>
              {activeTab==="sources"?"Sources":activeTab==="discover"?"Discover":"Settings"}
            </div>}
          </div>

          <div style={{ flex:1, overflowY:"auto" }}>
            {activeTab==="feed" && (
              <div style={{ padding:"20px 24px 40px", maxWidth:760, width:"100%" }}>
                {showBookmarks && <div style={{ padding:"10px 14px", marginBottom:14, background:"rgba(251,191,36,0.05)", border:"0.5px solid rgba(251,191,36,0.15)", borderRadius:8, fontSize:12, color:"var(--amber)", fontFamily:"var(--font-mono)" }}>◆ Showing {bookmarks.size} saved items</div>}

                {loading
                  ? <div style={{ display:"flex", justifyContent:"center", padding:80 }}><Spinner/></div>
                  : filtered.length===0
                  ? <div style={{ textAlign:"center", padding:"80px 0", color:"var(--text3)", fontSize:13 }}><div style={{ fontSize:40, opacity:0.2, marginBottom:12 }}>◈</div>No items found</div>
                  : <>
                      <div style={{ fontSize:11, fontFamily:"var(--font-mono)", color:"var(--text3)", marginBottom:14 }}>
                        {pagination.total_count} articles · page {pagination.page} of {pagination.total_pages}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        {filtered.map(item=><FeedCard key={item.id} item={item} onLike={handleLike} onBookmark={handleBookmark}/>)}
                      </div>
                      {pagination.page < pagination.total_pages && (
                        <div style={{ textAlign:"center", marginTop:24 }}>
                          <button onClick={()=>fetchFeed(pagination.page+1, activeCategory, false)} disabled={loadingMore}
                            style={{ background:"var(--surface)", border:"0.5px solid var(--border)", borderRadius:8, padding:"10px 24px", color:"var(--text2)", fontSize:13, fontFamily:"var(--font-body)", cursor:"pointer" }}>
                            {loadingMore ? "Loading…" : `Load more (${pagination.total_count - feed.length} remaining)`}
                          </button>
                        </div>
                      )}
                      <div style={{ textAlign:"center", padding:"24px 0", fontSize:11, color:"var(--text3)", fontFamily:"var(--font-mono)" }}>· {pagination.total_count} total articles ·</div>
                    </>
                }
              </div>
            )}
            {activeTab==="sources"  && <SourcesTab/>}
            {activeTab==="discover" && <DiscoverTab user={user}/>}
            {activeTab==="settings" && <SettingsTab user={user} onLogout={handleLogout}/>}
          </div>
        </div>
      </div>
    </>
  );
}


