export const UPSERT_ANNOTATION_DRAFT_MUTATION = `
  mutation UpsertAnnotationDraft($input: AnnotationDraftInput!) {
    upsertAnnotationDraft(input: $input) {
      id
      status
      updatedAt
    }
  }
`
