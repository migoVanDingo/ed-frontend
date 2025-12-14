// src/types/dashboard.ts

export type DashboardLoaderData = {
  datasets: DatasetSummary[];
  datastores: DatastoreSummary[];
  organizations: OrganizationSummary[];
  projects: ProjectSummary[];
  user: DashboardUserSummary;   // ⬅️ changed from UserSummary
};

export type DatasetSummary = {
  id: string;
  name: string;
  description?: string | null;
  created_at: number; // epoch seconds from backend
};

export type OrganizationSummary = {
  id: string;
  name: string;
  description?: string | null;
  created_at: number;
};

export type ProjectSummary = {
  id: string;
  name: string;
  description?: string | null;
  created_at: number;
};

export type DatastoreSummary = {
  id: string;
  name: string;
  description?: string | null;
  created_at?: number; // include if you requested it in GraphQL
  metrics: DatastoreMetrics;
};

export type DatastoreMetrics = {
  capacityBytes: number | null;
  usedBytes: number;
  freeBytes: number | null;
  usedPercent: number | null;
  fileCount: number;
  lastUploadAt: string | null; // ISO datetime from GraphQL
  byCategory: DatastoreCategoryBreakdown[];
};

export type DatastoreCategoryBreakdown = {
  category: string;        // "csv", "json", "mp4", "wav", "video", "audio", "other"
  contentTypes: string[];  // underlying MIME types
  fileCount: number;
  totalBytes: number;
};

export type DashboardUserSummary = {
  id: string;
  email: string;
  displayName?: string | null;
};

// Keep your existing "full" user type for other contexts
export type UserSummary = {
  id: string;
  email: string;
  username: string;
  idp_uid: string;
  status: string;        // "pending", ...
  is_active: boolean;
  is_verified: boolean;
  created_at: number;    // epoch seconds
  updated_at: number;
  deleted_at: number | null;
};
