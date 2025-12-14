export const makeClientFileId = (file: File): string =>
  `${file.name}-${file.size}-${file.lastModified}`;