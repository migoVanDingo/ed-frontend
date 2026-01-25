import type { LoaderFunctionArgs } from "react-router-dom"
import { apolloClient } from "../apollo/apolloClient"
import { DATASET_LABELER_QUERY } from "../graphql/query/datasetQuery"
import { DATASTORE_FILES_QUERY } from "../graphql/query/datastoreQuery"

export async function datasetLabelerLoader({ params }: LoaderFunctionArgs) {
  const datasetId = params.datasetId
  if (!datasetId) throw new Response("Missing datasetId", { status: 400 })

  const datasetResult = await apolloClient.query({
    query: DATASET_LABELER_QUERY,
    variables: { datasetId },
    fetchPolicy: "network-only",
  })

  if (datasetResult.errors?.length) {
    throw new Response(datasetResult.errors[0].message, { status: 500 })
  }

  const dataset = datasetResult.data?.dataset
  if (!dataset) {
    throw new Response("Dataset not found", { status: 404 })
  }

  const datastoreId = dataset.datastoreId
  if (!datastoreId) {
    throw new Response("Dataset missing datastoreId", { status: 500 })
  }

  const limit = 50
  const offset = 0

  const datastoreResult = await apolloClient.query({
    query: DATASTORE_FILES_QUERY,
    variables: { datastoreId, limit, offset },
    fetchPolicy: "network-only",
  })

  if (datastoreResult.errors?.length) {
    throw new Response(datastoreResult.errors[0].message, { status: 500 })
  }

  const filesPage = datastoreResult.data?.datastore?.files
  const datastoreFiles = filesPage?.items ?? []
  const filesById = new Map(datastoreFiles.map((file) => [file.id, file]))

  const datasetItems = dataset.items ?? []
  const datasetFiles =
    datasetItems.length > 0
      ? datasetItems.map((item: any) => {
          const file = filesById.get(item.fileId)
          return {
            id: item.fileId,
            datasetItemId: item.id,
            name: file?.filename ?? item.fileId,
            status: item.status ?? "new",
            objectKey: file?.objectKey ?? null,
            bucket: file?.bucket ?? null,
            storageProvider: file?.storageProvider ?? null,
            contentType: file?.contentType ?? null,
            meta: file?.meta ?? null,
            createdAt: item.createdAt ?? file?.createdAt ?? null,
          }
        })
      : (dataset.fileLinks ?? []).map((link: any) => {
          const file = filesById.get(link.fileId)
          return {
            id: link.fileId,
            datasetItemId: null,
            name: file?.filename ?? link.fileId,
            status: "new",
            objectKey: file?.objectKey ?? null,
            bucket: file?.bucket ?? null,
            storageProvider: file?.storageProvider ?? null,
            contentType: file?.contentType ?? null,
            meta: file?.meta ?? null,
            createdAt: file?.createdAt ?? null,
          }
        })

  return {
    dataset: {
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      datastoreId,
    },
    datasetFiles,
    datasetItems,
    datastoreFiles,
  }
}
