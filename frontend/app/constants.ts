export const API =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000";

export const CATEGORIES = [
  { id: "all",       label: "All",       icon: "◈" },
  { id: "research",  label: "Research",  icon: "⬡" },
  { id: "models",    label: "Models",    icon: "◉" },
  { id: "development", label: "Dev",     icon: "◫" },
  { id: "social",    label: "Social",    icon: "◎" },
  { id: "companies", label: "Companies", icon: "◪" },
  { id: "events",    label: "Events",    icon: "◷" },
];

export const SOURCE_COLORS: Record<string, string> = {
  reddit: "#FF4500",
  arxiv: "#B5451B",
  github: "#238636",
  blog: "#10A37F",
  twitter: "#E7E9EA",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  newsletter: "#7C3AED",
  research: "#8B5CF6",
  company: "#F59E0B",
  news: "#3B9EFF",
  default: "#3B9EFF",
};

export const SOURCE_TYPE_OPTIONS = [
  { value: "arxiv",    label: "arXiv (research papers)" },
  { value: "github",   label: "GitHub (repository releases)" },
  { value: "reddit",   label: "Reddit (subreddit)" },
  { value: "rss",      label: "RSS / Atom feed" },
  { value: "blog",     label: "Blog" },
  { value: "news",     label: "News site" },
  { value: "company",  label: "Company blog" },
  { value: "research", label: "Research site" },
  { value: "social",   label: "Social media" },
];
