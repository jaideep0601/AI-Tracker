export type User = { email: string; name: string };

export type Source = {
  id: number;
  name: string;
  type: string;
  url: string;
  description?: string;
  rating: number;
  quality_score: number;
  active: boolean;
  fetch_error_count: number;
  last_fetched_at?: string;
};

export type FeedItem = {
  id: number;
  category: string;
  source: Source;
  title: string;
  content: string;
  url: string;
  author: string;
  published_at: string;
  liked: boolean | null;
  bookmarked: boolean;
};

export type Pagination = {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
};

export type Stats = {
  total_articles: number;
  total_sources: number;
  categories: Record<string, number>;
  last_updated: string;
};

export type TopSource = {
  source_id: number;
  source_name: string;
  source_type: string;
  rating: number;
  thumbs_up_count: number;
  thumbs_down_count: number;
  engagement_ratio: number;
};

export type FetchResult = {
  source_id: number;
  name: string;
  ok: boolean;
  inserted: number;
  skipped: number;
  error?: string;
};
