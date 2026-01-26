export const COMMIT_ANNOTATION_DRAFT_MUTATION = `
  mutation CommitAnnotationDraft($input: AnnotationCommitInput!) {
    commitAnnotationDraft(input: $input) {
      annotationRevisionId
      annotationIds
    }
  }
`
