export const ServicePort = {
  UPLOAD_MANAGER: "5006",
  USER: "5003",
  DATASTORE: "5007",
  NOTIFICATION: "5004",
  GRAPHQL: "5005",
  PROJECT: "5009",
} as const

export const ProjectEndoint = {
    CREATE: "/api/project/create",
    READ: "/api/project/read",
    READ_LIST: "/api/project/list",
    UPDATE: "/api/project/update",
    DELETE: "/api/project/delete",
} as const