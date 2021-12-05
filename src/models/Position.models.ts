import SystemError from "../errors/system.error";

import { Fill, FillArray, FillSideEnum } from "./Exchange.models";

/**
 * Represents aggrupation of Fills by @FillSideEnum.
 *
 * Contraints:
 * - Fills side must match Block side
 */
class Block extends FillArray {
  private __size: number = 0;

  constructor(public side: FillSideEnum, public sizeUnit: string) {
    super();
  }

  private set _size(_size: number) {
    this.__size = this.__size + _size;
  }

  private get _size() {
    return this.__size;
  }

  /**
   * Gets the total size of sizeUnit given the fills
   */
  public get size() {
    return this._size;
  }

  /**
   * Calculate the breakEven price given the fills
   */
  get breakEven() {
    return this.reduce<number>((weightedMean: number, fill: Fill) => {
      const weight = fill.size/this._size;
      
      return weightedMean + (fill.price * weight);
    }, 0);
  }

  push(...items: Fill[]): number {
    if (!items.every((x) => x.side === this.side)) {
      throw SystemError.constraintViolated(
        `Fill side does not match Block side`
      );
    }

    // Keep _size updated for size prop getter
    this._size = this._size + items.reduce<number>((sizeTotal: number, fill: Fill) => sizeTotal + fill.size, 0);

    return super.push(...items);
  }
}

/**
 * Comprises Blocks for a Position
 */
class PositionBlocks extends Array<Block> {
  constructor(public sizeUnit: string, ...items: Block[]) {
    super(...items);

    this._validateItems(...items);
  }

  /**
   * Constraint items appended to the Array. Contraints:
   *
   * - No matching side Block can be next to each other.
   * @param items Block items
   */
  private _validateItems(...items: Block[]) {
    let isValid = true;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (this.lastIndex === -1) continue;

      isValid =
        isValid &&
        item.side !== this[this.lastIndex].side &&
        (i === 0 || item.side !== items[i - 1]?.side);

      if (!isValid)
        throw SystemError.constraintViolated(
          `No matching side Block can be next to each other.`
        );

      isValid =
        isValid &&
        item.sizeUnit === this[this.lastIndex].sizeUnit &&
        (i === 0 || item.sizeUnit === items[i - 1]?.sizeUnit);

      if (!isValid)
        throw SystemError.constraintViolated(
          `All blocks must be of the same sizeUnit.`
        );
    }
  }

  /**
   * Get last index based on length of Array. Returns -1 if no items are present.
   */
  public get lastIndex() {
    return this.length - 1;
  }

  push(...items: Block[]): number {
    this._validateItems(...items);

    return super.push(...items);
  }

  /**
   * Pushes fill into the last Block.
   * If the fill is not compatible, it creates and appends a new Block.
   *
   * @param fill Fill item
   */
  pushFill(fill: Fill) {
    const hasAny = this.lastIndex > -1;
    const isValid = this[this.lastIndex]?.side === fill.side;

    if (!hasAny || !isValid) this.push(new Block(fill.side, fill.sizeUnit));

    this[this.lastIndex].push(fill);

    // console.debug(this[this.lastIndex].sizeUnit, this[this.lastIndex].size, this[this.lastIndex].side, this[this.lastIndex].breakEven);
  }
}

/**
 * Represents a Position
 */
export interface Position {
  sizeUnit: string;

  size: number;
  breakEven: number;

  // blocks: PositionBlocks;
}

class PositionBlocksMap extends Map<string, PositionBlocks> {
  private _createPositionBlocksBySizeUnit(sizeUnit: string) {
    this.set(sizeUnit, new PositionBlocks(sizeUnit));
  }

  private _fillPositionBlocks(fill: Fill) {
    this.get(fill.sizeUnit)?.pushFill(fill);
  }

  processFill(fill: Fill) {
    if (!this.has(fill.sizeUnit))
      this._createPositionBlocksBySizeUnit(fill.sizeUnit);

    this._fillPositionBlocks(fill);
  }
}

/**
 * Utility class to build positions
 */
export class PositionBuilder {
  /**
   * Takes a list of fills to produce a list of positions
   * @param fills List of fills
   */
  static buildPositions(fills: FillArray): Array<Position> {
    // console.debug({ fills });

    const pbd = new PositionBlocksMap();

    for (let i = 0; i < fills.length; i++) {
      const fill = fills[i];

      pbd.processFill(fill);
    }

    // console.debug({ pbd });

    return new Array<Position>();
  }
}
