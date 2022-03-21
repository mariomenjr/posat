import { FillSideEnum } from "../models/Fill.models";
import GenericError from "./generic.error";

export class FillError extends GenericError {
  static fillSideNotSupported(side: FillSideEnum, sizeUnit: string) {
    return FillError.createError(
      new FillError(),
      `fillSideNotSupported`,
      `Fill side {${side}} is not supported. Check fills for ${sizeUnit}`
    );
  }

  static fillIgnoreJsonNotSupported() {
    return FillError.createError(
      new FillError(),
      `fillIgnoreJsonNotSupported`,
      `Check content format in 'fills.ignore.json', an array of integers is required`
    );
  }

  static fillPushJsonNotSupported() {
    return FillError.createError(
      new FillError(),
      `fillPushJsonNotSupported`,
      `Check content format in 'fills.push.json', an array of Fill is required`
    );
  }
}
