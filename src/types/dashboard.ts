// src/types/dashboard.ts

export type DashboardLoaderData = {
  datasets: DatasetSummary[];
  datastores: DatastoreSummary[];
  organizations: OrganizationSummary[];
  projects: ProjectSummary[];
  user: DashboardUserSummary;
};

export type DatasetSummary = {
  id: string;
  name: string;
  description?: string | null;
  created_at: number; // epoch seconds from backend
  metrics?: DatasetMetrics | null; // ✅ NEW
};

export type DatasetMetrics = {
  fileCount: number;
  totalBytes: number;
  projectUsageCount: number;
  versionCount: number;
  collaboratorCount: number;
  likes: number;
  shares: number;
  updatedAt: number; // epoch seconds
};

// ...rest unchanged
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
  status: string;
  created_at: number;
};

export type DatastoreSummary = {
  id: string;
  name: string;
  description?: string | null;
  created_at?: number;
  metrics: DatastoreMetrics;
};

export type DatastoreMetrics = {
  capacityBytes: number | null;
  usedBytes: number;
  freeBytes: number | null;
  usedPercent: number | null;
  likes: number;
  shares: number;
  fileCount: number;
  lastUploadAt: string | null;
  byCategory: DatastoreCategoryBreakdown[];
};

export type DatastoreCategoryBreakdown = {
  category: string;
  contentTypes: string[];
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
  status: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};
