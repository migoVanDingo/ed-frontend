// graphql/dashboard.ts

export const DASHBOARD_OVERVIEW_QUERY = `
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
    }
    projects {
      id
      name
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
`
