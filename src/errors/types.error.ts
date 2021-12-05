import { GenericError } from "./generic.error";

export class TypeError extends GenericError {
  static invalidType(d: string = ``) {
    return TypeError.createError(
      new TypeError(),
      `InvalidType${!!d ? `: ${d}` : ``}`
    );
  }
}
