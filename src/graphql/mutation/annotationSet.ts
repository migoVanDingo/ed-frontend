export const GET_OR_CREATE_ANNOTATION_SET_MUTATION = `
  mutation GetOrCreateAnnotationSet($datasetId: ID!) {
    getOrCreateAnnotationSet(datasetId: $datasetId) {
      id
      status
    }
  }
`
