import type { ClientError } from 'graphql-request';

/**
 * Will return true if the client error contains an error with the given status code.
 */
export const hasErrorStatusCode = (error: ClientError, statusCode: number) => {
  if (!error.response.errors || error.response.errors?.length < 1) {
    return false;
  }

  return error.response.errors.some((error) => error.extensions?.status === statusCode);
};

/**
 * Will return true if the client error contains an error with one of the given status codes.
 */
export const hasErrorStatusCodes = (error: ClientError, statusCodes: number[]) => {
  if (!error.response.errors || error.response.errors?.length < 1) {
    return false;
  }

  return error.response.errors.some((error) => {
    for (const statusCode of statusCodes) {
      if (error.extensions?.status === statusCode) {
        return true;
      }
    }

    return false;
  });
};

/**
 * Will return the message for the first error with one of the given status codes.
 */
export const getMessageForErrorStatusCodes = (error: ClientError, statusCodes: number[]) => {
  if (!error.response.errors || error.response.errors?.length < 1) {
    return null;
  }

  const foundError = error.response.errors.find((error) => {
    for (const statusCode of statusCodes) {
      if (error.extensions?.status === statusCode) {
        return true;
      }
    }

    return false;
  });

  return foundError?.message ?? null;
};

/**
 * Will return the message for the first error with the given status code.
 */
export const getMessageForErrorStatusCode = (error: ClientError, statusCode: number) => {
  if (!error.response.errors || error.response.errors?.length < 1) {
    return null;
  }

  const foundError = error.response.errors.find((error) => error.extensions?.status === statusCode);

  return foundError?.message ?? null;
};

/**
 * Will return true if the client error contains an error with the given paths.
 */
export const hasPathError = (error: ClientError, ...paths: string[]) => {
  if (!error.response.errors || error.response.errors?.length < 1) {
    return false;
  }

  return error.response.errors.some((error) => {
    for (const path of paths) {
      if (error.path?.includes(path)) {
        return true;
      }
    }

    return false;
  });
};
