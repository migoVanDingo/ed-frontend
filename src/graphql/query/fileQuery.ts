export const FILE_SIGNED_URL_QUERY = `
  query FileSignedUrl($fileId: String!, $expiresIn: Int) {
    fileSignedUrl(fileId: $fileId, expiresIn: $expiresIn)
  }
`
