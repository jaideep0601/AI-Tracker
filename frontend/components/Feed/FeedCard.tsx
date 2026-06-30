"use client";
import { useState } from "react";
import { FeedItem } from "@/app/types";
import { API } from "@/app/constants";
import { SourceDot, StarRating, Tag } from "@/components/ui/SharedUI";
import { timeAgo } from "@/app/helpers";

interface Props {
  item: FeedItem;
  onLike: (id: number, liked: boolean) => void;
  onBookmark: (id: number) => void;
}

export default function FeedCard({ item, onLike, onBookmark }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.background = "var(--surface2)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.background = "var(--surface)"; }}
      style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "16px 18px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
    >
      {/* Top accent line reflects like state */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: item.liked === true
          ? "linear-gradient(90deg,transparent,var(--green),transparent)"
          : item.liked === false
          ? "linear-gradient(90deg,transparent,var(--red),transparent)"
          : "linear-gradient(90deg,transparent,var(--border2),transparent)",
        opacity: 0.6,
      }}/>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SourceDot source={item.source}/>
          <StarRating stars={item.source.rating}/>
        </div>
        <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>{timeAgo(item.published_at)}</span>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--text)", lineHeight: 1.4, marginBottom: 8 }}>{item.title}</div>

      <div style={{
        fontSize: 13, color: "var(--text2)", lineHeight: 1.6, marginBottom: 12,
        display: expanded ? "block" : "-webkit-box",
        WebkitLineClamp: expanded ? undefined : 2,
        WebkitBoxOrient: "vertical" as const,
        overflow: "hidden",
      }}>
        {item.content}
        {expanded && item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            style={{ display: "block", marginTop: 8, color: "var(--accent)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
            Read full article ↗
          </a>
        )}
      </div>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
        <Tag label={item.category}/>
        <Tag label={item.source.type}/>
        {item.author && <Tag label={`@${item.author.slice(0, 15)}`}/>}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "0.5px solid var(--border)", paddingTop: 10 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 4 }}>
          <LikeButton active={item.liked === true}  color="var(--green)" bg="rgba(52,211,153,0.12)" border="rgba(52,211,153,0.3)" label="↑" onClick={() => onLike(item.id, true)}/>
          <LikeButton active={item.liked === false} color="var(--red)"   bg="rgba(255,77,77,0.10)"  border="rgba(255,77,77,0.25)"  label="↓" onClick={() => onLike(item.id, false)}/>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => onBookmark(item.id)} style={{ background: "transparent", border: "none", color: item.bookmarked ? "var(--amber)" : "var(--text3)", cursor: "pointer", fontSize: 14, padding: "4px 6px" }}>
            {item.bookmarked ? "◆" : "◇"}
          </button>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ color: "var(--text3)", fontSize: 12, fontFamily: "var(--font-mono)", padding: "4px 6px", textDecoration: "none" }}>↗</a>
          )}
        </div>
      </div>
    </div>
  );
}

function LikeButton({ active, color, bg, border, label, onClick }: {
  active: boolean; color: string; bg: string; border: string; label: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      background: active ? bg : "transparent",
      border: `0.5px solid ${active ? border : "var(--border)"}`,
      borderRadius: 6, padding: "5px 10px",
      color: active ? color : "var(--text3)",
      cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)",
    }}>
      {label}
    </button>
  );
}

// Exported helper — called from page.tsx to persist feedback to backend
export async function submitFeedbackToApi(articleId: number, liked: boolean): Promise<void> {
  try {
    await fetch(`${API}/api/feedback/${articleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: liked ? 1 : -1 }),
    });
  } catch (e) {
    console.error("Failed to persist feedback:", e);
  }
}
