import { Position, PositionBuilder } from './../models/Position.models';
import { FillArray } from './../models/Exchange.models';

export default function calculatePositions(fills: FillArray): Array<Position> {
  const blocks = PositionBuilder.buildPositions(fills);

  throw Error();
}
