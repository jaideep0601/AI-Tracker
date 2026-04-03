"""
Fetch articles from selected sources (RSS/Atom, arXiv API, Reddit JSON).
"""

from __future__ import annotations

import hashlib
import logging
import re
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import feedparser
import httpx
from sqlalchemy.orm import Session

from models import Article, Source

logger = logging.getLogger(__name__)

USER_AGENT = (
    "ThinkStream/1.0 (AI news aggregator; +https://github.com/jaideep0601/AI-Tracker)"
)
MAX_ITEMS_PER_SOURCE = 25
HTTP_TIMEOUT = 25.0


def _url_hash(url: str) -> str:
    return hashlib.sha256((url or "").encode("utf-8")).hexdigest()


def _fp_time_to_dt(t: Any) -> Optional[datetime]:
    if not t:
        return None
    try:
        return datetime.fromtimestamp(time.mktime(t))
    except Exception:
        return None


def map_source_type_to_category(source_type: str) -> str:
    t = (source_type or "").lower()
    mapping = {
        "research": "research",
        "arxiv": "research",
        "blog": "models",
        "rss": "models",
        "news": "companies",
        "company": "companies",
        "github": "development",
        "social": "social",
        "twitter": "social",
        "reddit": "social",
    }
    return mapping.get(t, "models")


def _discover_feed_url(base_url: str) -> Optional[str]:
    base = base_url.strip().rstrip("/")
    candidates: List[str] = []
    if base:
        candidates.append(base)
    candidates.extend(
        [
            f"{base}/feed",
            f"{base}/rss",
            f"{base}/rss.xml",
            f"{base}/atom.xml",
            f"{base}/feed.xml",
            f"{base}/blog/feed",
            f"{base}/blog/rss.xml",
        ]
    )

    for c in candidates:
        if not c:
            continue
        try:
            parsed = feedparser.parse(c)
            if parsed.entries and len(parsed.entries) > 0:
                return c
        except Exception:
            continue

    try:
        with httpx.Client(
            timeout=HTTP_TIMEOUT,
            follow_redirects=True,
            headers={"User-Agent": USER_AGENT},
        ) as client:
            r = client.get(base_url)
            r.raise_for_status()
            text = r.text
        for m in re.finditer(
            r'<link[^>]+type=["\']application/(?:rss|atom)\+xml["\'][^>]*>',
            text,
            re.I,
        ):
            tag = m.group(0)
            hm = re.search(r'href=["\']([^"\']+)["\']', tag, re.I)
            if hm:
                href = hm.group(1)
                if href.startswith("/"):
                    from urllib.parse import urljoin

                    return urljoin(base_url, href)
                return href
    except Exception as e:
        logger.debug("HTML feed discovery failed for %s: %s", base_url, e)

    return None


def _arxiv_query_url_from_source(source: Source) -> str:
    url = source.url.lower()
    m = re.search(r"arxiv\.org/(?:abs|pdf)/([\d.]+)", url)
    if m:
        return (
            "http://export.arxiv.org/api/query?"
            f"id_list={m.group(1)}&max_results={MAX_ITEMS_PER_SOURCE}"
        )
    m2 = re.search(r"list/([^/]+)/recent", url)
    if m2 and m2.group(1) == "cs":
        cat = "cs.AI"
    elif m2:
        cat = m2.group(1)
    else:
        cat = "cs.AI"
    return (
        "http://export.arxiv.org/api/query?"
        f"search_query=cat:{cat}&sortBy=submittedDate&sortOrder=descending"
        f"&max_results={MAX_ITEMS_PER_SOURCE}"
    )


def _github_releases_atom(url: str) -> Optional[str]:
    m = re.match(r"https?://github\.com/([^/]+)/([^/]+)/?$", url.strip().rstrip("/"))
    if m:
        return f"https://github.com/{m.group(1)}/{m.group(2)}/releases.atom"
    return None


def _insert_article(
    db: Session,
    source: Source,
    *,
    title: str,
    content: Optional[str],
    link: Optional[str],
    author: Optional[str],
    published_at: Optional[datetime],
    external_id: Optional[str],
) -> str:
    """Returns 'inserted' or 'skipped'."""
    if not title or not link:
        return "skipped"
    uh = _url_hash(link)
    existing = db.query(Article).filter(Article.url_hash == uh).first()
    if existing:
        return "skipped"

    cat = map_source_type_to_category(source.type)
    art = Article(
        source_id=source.id,
        external_id=external_id,
        title=title[:1024],
        content=(content or "")[:20000] if content else None,
        url=link[:2048],
        url_hash=uh,
        category=cat,
        author=author[:255] if author else None,
        published_at=published_at or datetime.utcnow(),
        fetched_at=datetime.utcnow(),
        article_metadata={"ingested_via": source.type},
    )
    db.add(art)
    return "inserted"


def ingest_from_rss_feed(db: Session, source: Source, feed_url: str) -> Tuple[int, int, Optional[str]]:
    inserted = skipped = 0
    try:
        parsed = feedparser.parse(feed_url)
    except Exception as e:
        return 0, 0, str(e)

    if not parsed.entries:
        return 0, 0, "No entries in feed (wrong URL or empty)"

    for entry in parsed.entries[:MAX_ITEMS_PER_SOURCE]:
        title = (entry.get("title") or "").strip()
        link = (entry.get("link") or "").strip()
        if not link and entry.get("id"):
            link = str(entry["id"])
        summary = entry.get("summary") or entry.get("description") or ""
        author = None
        if entry.get("author"):
            author = str(entry["author"])[:255]
        elif entry.get("authors"):
            author = str(entry["authors"][0].get("name", ""))[:255]

        published_at = _fp_time_to_dt(entry.get("published_parsed") or entry.get("updated_parsed"))
        ext_id = entry.get("id") or link

        r = _insert_article(
            db,
            source,
            title=title,
            content=summary,
            link=link,
            author=author,
            published_at=published_at,
            external_id=str(ext_id)[:255] if ext_id else None,
        )
        if r == "inserted":
            inserted += 1
        else:
            skipped += 1

    return inserted, skipped, None


def ingest_arxiv(db: Session, source: Source) -> Tuple[int, int, Optional[str]]:
    qurl = _arxiv_query_url_from_source(source)
    return ingest_from_rss_feed(db, source, qurl)


def ingest_reddit(db: Session, source: Source) -> Tuple[int, int, Optional[str]]:
    m = re.search(r"reddit\.com/r/([^/?#]+)", source.url, re.I)
    if not m:
        return 0, 0, "Could not parse subreddit from URL"
    sub = m.group(1)
    api_url = f"https://www.reddit.com/r/{sub}/hot.json?limit={MAX_ITEMS_PER_SOURCE}&raw_json=1"
    try:
        with httpx.Client(timeout=HTTP_TIMEOUT, headers={"User-Agent": USER_AGENT}) as client:
            r = client.get(api_url)
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        return 0, 0, str(e)

    children = data.get("data", {}).get("children") or []
    inserted = skipped = 0
    for ch in children:
        d = ch.get("data") or {}
        if d.get("stickied"):
            continue
        title = (d.get("title") or "").strip()
        url = (d.get("url_overridden_by_dest") or d.get("url") or "").strip()
        permalink = d.get("permalink")
        if permalink and not url.startswith("http"):
            url = "https://www.reddit.com" + permalink
        elif "reddit.com" not in url and permalink:
            url = "https://www.reddit.com" + permalink
        body = d.get("selftext") or ""
        author = d.get("author")
        ts = d.get("created_utc")
        published_at = datetime.utcfromtimestamp(ts) if ts else None

        rcode = _insert_article(
            db,
            source,
            title=title,
            content=body[:20000] if body else None,
            link=url,
            author=str(author) if author else None,
            published_at=published_at,
            external_id=d.get("name"),
        )
        if rcode == "inserted":
            inserted += 1
        else:
            skipped += 1

    return inserted, skipped, None


def ingest_source(db: Session, source: Source) -> Dict[str, Any]:
    """Insert new articles for one source. Commits on success."""
    st = (source.type or "").lower()

    if st in ("twitter", "linkedin"):
        return {
            "ok": False,
            "inserted": 0,
            "skipped": 0,
            "error": f"Source type '{source.type}' needs API credentials; use RSS or Reddit/arXiv/GitHub repo instead.",
        }

    if "trending" in source.url.lower() and "github.com" in source.url.lower():
        return {
            "ok": False,
            "inserted": 0,
            "skipped": 0,
            "error": "GitHub Trending has no public RSS feed. Add a repository URL to use its releases feed.",
        }

    inserted = skipped = 0
    err: Optional[str] = None

    try:
        if st == "reddit":
            inserted, skipped, err = ingest_reddit(db, source)
        elif st == "arxiv":
            inserted, skipped, err = ingest_arxiv(db, source)
        elif st == "github":
            gurl = _github_releases_atom(source.url)
            if gurl:
                inserted, skipped, err = ingest_from_rss_feed(db, source, gurl)
            else:
                return {
                    "ok": False,
                    "inserted": 0,
                    "skipped": 0,
                    "error": "Use a GitHub repository URL (e.g. https://github.com/org/repo) for release feeds.",
                }
        else:
            feed_url = _discover_feed_url(source.url)
            if not feed_url:
                return {
                    "ok": False,
                    "inserted": 0,
                    "skipped": 0,
                    "error": "Could not find an RSS or Atom feed for this URL. Try the site's RSS link or an arXiv/Reddit/GitHub repo URL.",
                }
            inserted, skipped, err = ingest_from_rss_feed(db, source, feed_url)

        if err:
            db.rollback()
            src = db.query(Source).filter(Source.id == source.id).first()
            if src:
                src.fetch_error_count = (src.fetch_error_count or 0) + 1
                db.commit()
            return {"ok": False, "inserted": 0, "skipped": 0, "error": err}

        source.last_fetched_at = datetime.utcnow()
        source.fetch_error_count = 0
        db.commit()

        return {"ok": True, "inserted": inserted, "skipped": skipped, "error": None}
    except Exception as e:
        logger.exception("ingest_source failed for source_id=%s", source.id)
        db.rollback()
        try:
            source.fetch_error_count = (source.fetch_error_count or 0) + 1
            db.commit()
        except Exception:
            db.rollback()
        return {"ok": False, "inserted": 0, "skipped": 0, "error": str(e)}


def ingest_sources_by_ids(db: Session, source_ids: List[int]) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []
    for sid in source_ids:
        src = db.query(Source).filter(Source.id == sid).first()
        if not src:
            results.append(
                {
                    "source_id": sid,
                    "name": "",
                    "ok": False,
                    "inserted": 0,
                    "skipped": 0,
                    "error": "Source not found",
                }
            )
            continue
        out = ingest_source(db, src)
        results.append(
            {
                "source_id": src.id,
                "name": src.name,
                "ok": out["ok"],
                "inserted": out["inserted"],
                "skipped": out["skipped"],
                "error": out.get("error"),
            }
        )
    return results
