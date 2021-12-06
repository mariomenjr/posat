import { FillSideEnum } from "../models/Exchange.models";
import GenericError from "./generic.error";

export class FillError extends GenericError {
  static fillSideNotSupported(side: FillSideEnum, sizeUnit: string) {
    return FillError.createError(
      new FillError(),
      `fillSideNotSupported`,
      `Fill side {${side}} is not supported. Check fills for ${sizeUnit}`
    );
  }
}
