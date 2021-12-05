import SystemError from "../errors/system.error";
import TypeError from "../errors/type.error";

import { Fill, FillArray, FillSideEnum } from "./Exchange.models";

/**
 * Represents aggrupation of Fills by @FillSideEnum
 */
export interface Block {
  sizeUnit: string;
  side: FillSideEnum;
  fills: FillArray;
}

/**
 * Represents an agrupation of Blocks. Constraints:
 * 
 * - No matching side BlockArray can be next to each other.
 */
export class BlockArray extends Array<Block> {
  constructor(public side: FillSideEnum) {
    super();
  }

  push(...items: Block[]): number {
    if (!items.every((x) => x.side === this.side)) {
      throw TypeError.invalidType(`Fill side does not match Block side`);
    }
    return super.push(...items);
  }
}

/**
 * Comprises BlockArrays for a Position
 */
export class PositionBlocks extends Array<BlockArray> {
  constructor(public sizeUnit: string, ...items: BlockArray[]) {
    super(...items);

    this.validateItems(...items);
  }

  /**
   * Constraint items appended to the Array. Contraints: 
   * 
   * - No matching side BlockArray can be next to each other.
   * @param items BlockArray items
   */
  private validateItems(...items: BlockArray[]) {
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
          `No matching side BlockArray can be next to each other.`
        );
    }
  }

  /**
   * Get last index based on length of Array. Returns -1 if no items are present.
   */
  public get lastIndex() {
    return this.length - 1;
  }

  push(...items: BlockArray[]): number {
    this.validateItems(...items);

    return super.push(...items);
  }

  /**
   * Pushes fill into the last BlockArray.
   * If the fill is not compatible, it creates and appends a new BlockArray.
   * 
   * @param fill Fill item
   */
  pushFill(fill: Fill) {
    const hasAny = this.lastIndex > -1;
    const isValid = this[this.lastIndex]?.side === fill.side;

    if (!hasAny || !isValid) this.push(new BlockArray(fill.side));

    this[this.lastIndex].push({
      sizeUnit: fill.sizeUnit,
      side: fill.side,
      fills: [fill],
    });
  }
}

/**
 * Represents a Position
 */
export interface Position {
  sizeUnit: string;

  size: number;
  breakEven: number;

  blocks: PositionBlocks;
}

class PositionBlocksMap extends Map<string, PositionBlocks> {
  private createPositionBlocksBySizeUnit(sizeUnit: string) {
    this.set(sizeUnit, new PositionBlocks(sizeUnit));
  }

  private fillPositionBlocks(fill: Fill) {
    this.get(fill.sizeUnit)?.pushFill(fill);
  }

  processFill(fill: Fill) {
    if (!this.has(fill.sizeUnit))
      this.createPositionBlocksBySizeUnit(fill.sizeUnit);

    this.fillPositionBlocks(fill);
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

    return new Array<Position>();
  }
}
