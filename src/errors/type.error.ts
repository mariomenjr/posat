import GenericError from "./generic.error";

export default class TypeError extends GenericError {
  static invalidType(d: string = ``) {
    return TypeError.createError(
      new TypeError(),
      `InvalidType`,
      d
    );
  }
}
