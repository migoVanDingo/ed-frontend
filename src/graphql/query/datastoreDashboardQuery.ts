// graphql/datastoreDashboard.ts
import { gql } from "@apollo/client";

export const DATASTORE_DASHBOARD_QUERY = gql`
  query DatastoreDashboard(
    $datastoreId: String!
    $limit: Int!
    $offset: Int!
  ) {
    datastore(id: $datastoreId) {
      id
      name
      description
      createdAt

      metrics {
        capacityBytes
        usedBytes
        freeBytes
        usedPercent
        fileCount
        lastUploadAt
        byCategory {
          category
          contentTypes
          fileCount
          totalBytes
        }
      }

      files(limit: $limit, offset: $offset) {
        items {
          id
          filename
          contentType
          size
          createdAt
        }
        totalCount
        limit
        offset
      }
    }
  }
`;
