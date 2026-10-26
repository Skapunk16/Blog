export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  status: 'published' | 'draft';
  tags: string[];
  views: number;
  readingTime: number;
  updatedAt?: string;
}

export interface AdminStats {
  totalPosts: number;
  publishedCount: number;
  draftCount: number;
  totalViews: number;
  totalTags: number;
}

export interface AuthUser {
  username: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}
