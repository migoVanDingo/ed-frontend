// loaders/datastoreDashboardLoader.ts
import type { LoaderFunctionArgs } from "react-router-dom";
import { apolloClient } from "../apollo/apolloClient";
import { DATASTORE_DASHBOARD_QUERY } from "../graphql/query/datastoreDashboardQuery";

type DatastoreDashboardQueryResult = {
  datastore: {
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    metrics: {
      capacityBytes: string | null;
      usedBytes: string;
      freeBytes: string | null;
      usedPercent: number | null;
      fileCount: number;
      lastUploadAt: string | null;
      byCategory: {
        category: string;
        contentTypes: string[];
        fileCount: number;
        totalBytes: string;
      }[];
    };
    files: {
      items: {
        id: string;
        filename: string;
        contentType: string;
        size: number;
        createdAt: string;
      }[];
      totalCount: number;
      limit: number;
      offset: number;
    };
  } | null;
};

const toEpochSeconds = (value: string | number | null | undefined): number => {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return 0;
  return Math.floor(ms / 1000);
};

export async function datastoreDashboardLoader(
  { params }: LoaderFunctionArgs
) {
  const datastoreId = params.datastoreId;
  if (!datastoreId) {
    throw new Response("Missing datastoreId", { status: 400 });
  }

  try {
    const { data } = await apolloClient.query<DatastoreDashboardQueryResult>({
      query: DATASTORE_DASHBOARD_QUERY,
      variables: {
        datastoreId, // String!
        limit: 5,    // 👈 required Int!
        offset: 0,   // 👈 required Int!
      },
      fetchPolicy: "network-only",
    });

    if (!data.datastore) {
      throw new Response("Datastore not found", { status: 404 });
    }

    const ds = data.datastore;

    return {
      datastoreId: ds.id,
      datastoreName: ds.name,
      datastoreDescription: ds.description,
      created_at: toEpochSeconds(ds.createdAt),
      metrics: ds.metrics,
      initialFilesPage: {
        items: ds.files.items.map((f) => ({
          id: f.id,
          filename: f.filename,
          contentType: f.contentType,
          size: f.size,
          created_at: toEpochSeconds(f.createdAt),
        })),
        totalCount: ds.files.totalCount,
        limit: ds.files.limit,
        offset: ds.files.offset,
      },
    };
  } catch (err) {
    console.error("Datastore dashboard loader error", err);
    if (err instanceof Response) throw err;
    throw new Response("Failed to load datastore dashboard", { status: 500 });
  }
}
