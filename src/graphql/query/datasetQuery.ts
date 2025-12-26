// src/graphql/query/datasetQuery.ts
import { gql } from "@apollo/client";

export const DATASET_EDIT_QUERY = gql`
  query DatasetEditPage($datasetId: ID!) {
    dataset(id: $datasetId) {
      id
      name
      description
      datastoreId
      items {
        id
        fileId
        createdAt
        status
      }
    }
  }
`;

export const DATASET_DETAIL_QUERY = gql`
  query DatasetDetailPage($datasetId: ID!) {
    dataset(id: $datasetId) {
      id
      name
      description
      datastoreId
      items {
        id
        fileId
        createdAt
        status
      }
    }
  }
`;

export const PROJECT_DATASETS_QUERY = gql`
  query ProjectWithDatasets($projectId: ID!) {
    project(id: $projectId) {
      id
      name
      datasets {
        id
        name
        description
        createdAt
        updatedAt
        items {
          id
          fileId
          status
        }
      }
    }
  }
`

export const CREATE_DATASET_MUTATION = gql`
  mutation CreateDataset($input: CreateDatasetInput!) {
    createDataset(input: $input) {
      id
      name
      description
    }
  }
`

export const ADD_FILES_TO_DATASET_MUTATION = gql`
  mutation AddFilesToDataset($datasetId: ID!, $fileIds: [ID!]!) {
    addFilesToDataset(datasetId: $datasetId, fileIds: $fileIds) {
      id
      name
    }
  }
`

export const ATTACH_DATASET_TO_PROJECT_MUTATION = gql`
  mutation AttachDatasetToProject($datasetId: ID!, $projectId: ID!) {
    attachDatasetToProject(datasetId: $datasetId, projectId: $projectId) {
      id
      projectId
    }
  }
`
