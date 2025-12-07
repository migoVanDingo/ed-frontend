// loaders/dashboardLoader.ts
import { GraphQLClient } from "../graphql/GraphQLClient";
import { DASHBOARD_OVERVIEW_QUERY } from "../graphql/userDashboard";

const GRAPHQL_PORT = "5005"; // or whatever your service uses

type DashboardOverviewData = {
  me: {
    id: string;
    email: string;
    displayName?: string;
    datastores: any[];
    projects: any[];
    datasets: any[];
    organizations: any[];
  };
};

export async function userDashboardLoader() {
  const res = await GraphQLClient.query<DashboardOverviewData>(
    DASHBOARD_OVERVIEW_QUERY,
    GRAPHQL_PORT
  );

  if (!res.success || !res.data?.me) {
    // If you want more granular behavior, inspect res.status / res.errors
    throw new Response("Failed to load dashboard data", {
      status: res.status ?? 500,
    });
  }

  const me = res.data.me;

  return {
    user: {
      id: me.id,
      email: me.email,
      displayName: me.displayName,
    },
    datastores: me.datastores ?? [],
    projects: me.projects ?? [],
    datasets: me.datasets ?? [],
    organizations: me.organizations ?? [],
  };
}
