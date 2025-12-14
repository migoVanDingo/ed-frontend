// src/graphql/subscriptions.ts
import { gql } from "@apollo/client";

export const DATASTORE_UPDATED_SUBSCRIPTION = gql`
  subscription DatastoreUpdated($datastoreId: ID!) {
    datastoreUpdated(datastoreId: $datastoreId) {
      id
      name
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
    }
  }
`;
