"use client";
import { Source } from "@/app/types";
import { getSourceColor } from "@/app/helpers";

export function SourceDot({ source }: { source: Source }) {
  const color = getSourceColor(source.type);
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontFamily:"var(--font-mono)", color:"var(--text2)" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:color, boxShadow:`0 0 5px ${color}`, flexShrink:0 }}/>
      {source.name}
    </span>
  );
}

export function StarRating({ stars, size = 9 }: { stars: number; size?: number }) {
  return (
    <span style={{ display:"flex", gap:1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize:size, color: i <= stars ? "var(--amber)" : "var(--text3)" }}>★</span>
      ))}
    </span>
  );
}

export function Tag({ label }: { label: string }) {
  return (
    <span style={{
      fontSize:10, fontFamily:"var(--font-mono)", color:"var(--accent)",
      background:"rgba(59,158,255,0.08)", border:"0.5px solid rgba(59,158,255,0.2)",
      borderRadius:4, padding:"2px 7px", whiteSpace:"nowrap",
    }}>
      {label}
    </span>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div style={{
      width:size, height:size,
      border:"2px solid var(--border)", borderTop:"2px solid var(--accent)",
      borderRadius:"50%", animation:"spin 0.8s linear infinite",
    }}/>
  );
}

export function EmptyState({ icon = "◈", message }: { icon?: string; message: string }) {
  return (
    <div style={{ textAlign:"center", padding:"80px 0", color:"var(--text3)" }}>
      <div style={{ fontSize:40, opacity:0.2, marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:13 }}>{message}</div>
    </div>
  );
}
