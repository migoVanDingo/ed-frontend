// datasetDetailLoader.ts
import type { LoaderFunctionArgs } from "react-router-dom";
import { apolloClient } from "../apollo/apolloClient";
import { DATASET_DETAIL_QUERY } from "../graphql/query/datasetQuery";
import { DATASTORE_FILES_QUERY } from "../graphql/query/datastoreQuery";

export async function datasetDetailLoader({ params }: LoaderFunctionArgs) {
  const datasetId = params.datasetId;
  if (!datasetId) throw new Response("Missing datasetId", { status: 400 });

  const datasetResult = await apolloClient.query({
    query: DATASET_DETAIL_QUERY,
    variables: { datasetId },
    fetchPolicy: "network-only",
  });

  if (datasetResult.errors?.length) {
    throw new Response(datasetResult.errors[0].message, { status: 500 });
  }

  const dataset = datasetResult.data?.dataset;
  if (!dataset) {
    throw new Response("Dataset not found", { status: 404 });
  }

  const datastoreId = dataset.datastoreId;
  if (!datastoreId) {
    throw new Response("Dataset missing datastoreId", { status: 500 });
  }

  const limit = 50;
  const offset = 0;

  const datastoreResult = await apolloClient.query({
    query: DATASTORE_FILES_QUERY,
    variables: { datastoreId, limit, offset },
    fetchPolicy: "network-only",
  });

  if (datastoreResult.errors?.length) {
    throw new Response(datastoreResult.errors[0].message, { status: 500 });
  }

  const filesPage = datastoreResult.data?.datastore?.files;

  return {
    dataset: {
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      datastoreId,
    },
    datasetItems: dataset.fileLinks ?? [],
    datastoreFiles: filesPage?.items ?? [],
    datastoreFilesMeta: {
      totalCount: filesPage?.totalCount ?? 0,
      limit: filesPage?.limit ?? limit,
      offset: filesPage?.offset ?? offset,
    },
    datasetMetrics: null,
  };
}
