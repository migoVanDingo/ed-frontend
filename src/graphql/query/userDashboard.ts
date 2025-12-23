import { gql } from "@apollo/client";

export const DASHBOARD_OVERVIEW_QUERY = gql`
  query DashboardOverview {
    me {
      id
      email
      displayName

      organizations {
        id
        name
        description
        createdAt
      }

      datastores {
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
      }

      projects {
        id
        name
        status
        description
        createdAt
      }

      datasets {
        id
        name
        description
        createdAt
      }
    }
  }
`;
