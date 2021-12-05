import GenericError from "./generic.error";

export default class SystemError extends GenericError {
  static notSupported(d: string = ``) {
    return SystemError.createError(new SystemError(), `NotSupported`, d);
  }

  static constraintViolated(d: string = ``) {
    return SystemError.createError(new SystemError(), `constraintViolated`, d);
  }
}
