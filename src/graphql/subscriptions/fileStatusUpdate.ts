// src/graphql/subscriptions/fileStatusUpdated.ts
import { gql } from "@apollo/client";

export const FILE_STATUS_UPDATED_SUBSCRIPTION = gql`
  subscription FileStatusUpdated(
    $datastoreId: ID!
    $uploadSessionId: ID
  ) {
    fileStatusUpdated(
      datastoreId: $datastoreId
      uploadSessionId: $uploadSessionId
    ) {
      fileId
      datastoreId
      uploadSessionId
      oldStatus
      newStatus
      occurredAt
    }
  }
`;
