import SystemError from "../errors/system.error";
import { FillError } from "../errors/fill.error";

import { roundByDecimals } from "../utils/math.utils";

import { Fill, FillArray, FillSideEnum, FillProps } from "./Fill.models";

/**
 * Represents aggrupation of Fills by @FillSideEnum.
 *
 * Contraints:
 * - Fills side must match Block side
 */
class Block extends FillArray implements FillProps {
  constructor(public side: FillSideEnum, public sizeUnit: string) {
    super();
  }

  /**
   * Gets the total size of sizeUnit given the fills
   */
  public get size() {
    return this.reduce<number>((size: number, fill: Fill) => {
      switch (fill.side) {
        case FillSideEnum.BUY:
          return size + fill.size;

        case FillSideEnum.SELL:
          return size - fill.size;

        default:
          throw FillError.fillSideNotSupported(fill.side, fill.sizeUnit);
      }
    }, 0);
  }

  public get fee() {
    return this.reduce<number>((fee: number, fill: Fill) => {
      switch (fill.side) {
        case FillSideEnum.BUY:
          return fee + fill.fee;

        case FillSideEnum.SELL:
          return fee - fill.fee;

        default:
          throw FillError.fillSideNotSupported(fill.side, fill.sizeUnit);
      }
    }, 0);
  }

  /**
   * Calculate the breakEven price given the fills
   */
  get price() {
    const blockAbsSize = Math.abs(this.size);

    return this.reduce<number>((weightedMean: number, fill: Fill) => {
      const weight = fill.size / blockAbsSize;

      return weightedMean + fill.price * weight;
    }, 0);
  }

  get total() {
    return this.price * this.size;
  }

  push(...items: Fill[]): number {
    if (!items.every((x) => x.side === this.side)) {
      throw SystemError.constraintViolated(
        `Fill side does not match Block side`
      );
    }

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
          `[${this.sizeUnit}]. No matching side Block can be next to each other.`
        );

      isValid =
        isValid &&
        item.sizeUnit === this[this.lastIndex].sizeUnit &&
        (i === 0 || item.sizeUnit === items[i - 1]?.sizeUnit);

      if (!isValid)
        throw SystemError.constraintViolated(
          `[${this.sizeUnit}]. All blocks must be of the same sizeUnit.`
        );
    }
  }

  /**
   * Get last index based on length of Array. Returns -1 if no items are present.
   */
  public get lastIndex() {
    return this.length - 1;
  }

  public get size() {
    return this.reduce<number>((s: number, b: Block) => {
      return s + b.size;
    }, 0);
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
  }

  calculatePosition(): Position {
    const p = this.reduce<Position>(
      (position: Position, block: Block, currentIndex: number): Position => {
        if (currentIndex === 0) {
          if (block.side !== FillSideEnum.BUY) {
            return { ...position };
            // Ignore first SELL fills. Why? Revisit.
            //
            // throw SystemError.notSupported(
            //   `[${block.sizeUnit}] A ${block.side} block in the first position is not supported.`
            // );
          }
          return {
            ...position,
            breakEven: block.price,
            size: block.size,
          };
        }

        switch (block.side) {
          case FillSideEnum.BUY:
            const accumulatedSize = position.size + block.size;

            position.breakEven =
              block.price * (block.size / accumulatedSize) +
              position.breakEven * (position.size / accumulatedSize);
            position.size = accumulatedSize;
            break;

          case FillSideEnum.SELL:
            position.size += block.size;
            break;

          default:
            throw FillError.fillSideNotSupported(block.side, block.sizeUnit);
        }

        return { ...position };
      },
      {
        breakEven: 0,
        size: 0,
        sizeUnit: this.sizeUnit,
      }
    );

    p.size = Math.abs(roundByDecimals(p.size, 4));
    p.breakEven = roundByDecimals(p.breakEven, 8);

    return p;
  }
}

/**
 * Represents a Position
 */
export interface Position {
  readonly sizeUnit: string;
  size: number;
  breakEven: number;
}

export class PositionArray extends Array<Position> {
  errors: Error[] = [];

  public get breakEven(): number {
    return roundByDecimals(
      this.reduce<number>(
        (t: number, x: Position) => x.breakEven * x.size + t,
        0
      ),
      2
    );
  }
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

  buildPositions(): PositionArray {
    const excludes: string[] = [`USDT`, `USDC`];
    const positions: PositionArray = new PositionArray();

    for (const [sizeUnit, positionBlocks] of this) {
      try {
        if (!excludes.includes(sizeUnit))
          positions.push(positionBlocks.calculatePosition());
      } catch (error) {
        positions.errors.push(error as Error);
      }
    }

    return positions;
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
  static buildPositions(fills: FillArray): PositionArray {
    fills.sort((a: Fill, b: Fill) => a.createdAt.getTime() - b.createdAt.getTime());

    const pbd = new PositionBlocksMap();

    for (let i = 0; i < fills.length; i++) pbd.processFill(fills[i]);

    return pbd.buildPositions();
  }
}
