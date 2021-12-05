export class GenericError extends Error {

  protected static createError<T extends GenericError>(error: T, message: string): T {
    error.message = `${typeof error}: ${message}`;
    return error;
  }
}
