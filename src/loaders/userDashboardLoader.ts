// loaders/userDashboardLoader.ts
import { apolloClient } from "../apollo/apolloClient";
import { DASHBOARD_OVERVIEW_QUERY } from "../graphql/query/userDashboard";
import {
  type DashboardLoaderData,
  type DatastoreSummary,
  type DatasetSummary,
  type OrganizationSummary,
  type ProjectSummary,
} from "../types/dashboard";

type DashboardOverviewQueryResult = {
  me: {
    id: string;
    email: string;
    displayName?: string | null;
    organizations: {
      id: string;
      name: string;
      description?: string | null;
      createdAt: string; // ISO from GraphQL
    }[];
    datastores: {
      id: string;
      name: string;
      description?: string | null;
      createdAt?: string | null;
      metrics: DatastoreSummary["metrics"];
    }[];
    projects: {
      id: string;
      name: string;
      description?: string | null;
      createdAt: string;
    }[];
    datasets: {
      id: string;
      name: string;
      description?: string | null;
      createdAt: string;
    }[];
  };
};

const toEpochSeconds = (value: string | number | null | undefined): number => {
  if (value == null) return 0;
  if (typeof value === "number") return value; // already epoch seconds
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return 0;
  return Math.floor(ms / 1000);
};

export async function userDashboardLoader(): Promise<DashboardLoaderData> {
  try {
    const { data } = await apolloClient.query<DashboardOverviewQueryResult>({
      query: DASHBOARD_OVERVIEW_QUERY,
    });

    if (!data?.me) {
      throw new Response("Failed to load dashboard data", { status: 401 });
    }

    const me = data.me;

    const organizations: OrganizationSummary[] = (me.organizations ?? []).map(
      (org) => ({
        id: org.id,
        name: org.name,
        description: org.description,
        created_at: toEpochSeconds(org.createdAt),
      })
    );

    const projects: ProjectSummary[] = (me.projects ?? []).map((proj) => ({
      id: proj.id,
      name: proj.name,
      description: proj.description,
      created_at: toEpochSeconds(proj.createdAt),
    }));

    const datasets: DatasetSummary[] = (me.datasets ?? []).map((ds) => ({
      id: ds.id,
      name: ds.name,
      description: ds.description,
      created_at: toEpochSeconds(ds.createdAt),
    }));

    const datastores: DatastoreSummary[] = (me.datastores ?? []).map((ds) => ({
      id: ds.id,
      name: ds.name,
      description: ds.description,
      created_at: ds.createdAt
        ? toEpochSeconds(ds.createdAt)
        : undefined,
      metrics: ds.metrics,
    }));

    const loaderData: DashboardLoaderData = {
      user: {
        id: me.id,
        email: me.email,
        displayName: me.displayName,
      },
      organizations,
      projects,
      datasets,
      datastores,
    };

    return loaderData;
  } catch (err) {
    console.error("Dashboard loader error", err);
    throw new Response("Failed to load dashboard data", { status: 500 });
  }
}
