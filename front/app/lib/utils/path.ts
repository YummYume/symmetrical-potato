/**
 * Get the last part of a URI (generally an ID)
 */
export const getUriId = (uri: string) => {
  const uriParts = uri.split('/');

  return uriParts.at(-1) ?? '';
};
