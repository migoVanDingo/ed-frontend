export const ANNOTATION_DRAFT_QUERY = `
  query AnnotationDraft($annotationSetId: String!, $datasetItemId: String!, $status: String) {
    annotationDraft(
      annotationSetId: $annotationSetId
      datasetItemId: $datasetItemId
      status: $status
    ) {
      id
      status
      payload
    }
  }
`
