// src/graphql/query/datastoreQuery.ts
import { gql } from "@apollo/client";

export const DATASTORE_FILES_QUERY = gql`
  query DatastoreFiles($datastoreId: String!, $limit: Int!, $offset: Int!) {
    datastore(id: $datastoreId) {
      id
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
