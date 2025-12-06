// hooks/useDashboardData.ts
import { useRouteLoaderData } from "react-router-dom";

type DashboardLoaderData = {
  user: {
    id: string;
    email: string;
    displayName?: string;
  };
  datastores: any[]; // replace any with your actual types later
  projects: any[];
  datasets: any[];
};

export function useDashboardData(): DashboardLoaderData {
  return useRouteLoaderData("dashboard-layout") as DashboardLoaderData;
}

export function useCurrentUser() {
  const data = useDashboardData();
  return data.user;
}

export function useDatastores() {
  const data = useDashboardData();
  return data.datastores;
}

export function useProjects() {
  const data = useDashboardData();
  return data.projects;
}

export function useDatasets() {
  const data = useDashboardData();
  return data.datasets;
}
