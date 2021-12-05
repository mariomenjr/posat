export default class GenericError extends Error {

  protected static createError<T extends GenericError>(error: T, subType: string, message: string): T {
    error.message = `${error.constructor.name}.${subType}${!!message ? `: ${message}` : ``}`;
    return error;
  }
}
