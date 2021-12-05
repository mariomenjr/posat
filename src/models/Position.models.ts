import SystemError from "../errors/system.error";
import TypeError from "../errors/type.error";

import { Fill, FillArray, FillSideEnum } from "./Exchange.models";

export interface Block {
  sizeUnit: string;
  side: FillSideEnum;
  fills: FillArray;
}

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

export class PositionBlocks extends Array<BlockArray> {
  constructor(public sizeUnit: string, ...items: BlockArray[]) {
    super(...items);

    this.validateItems(...items);
  }

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

  public get lastIndex() {
    return this.length - 1;
  }

  push(...items: BlockArray[]): number {
    this.validateItems(...items);

    return super.push(...items);
  }

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

export class PositionBuilder {
  static buildPositions(fills: FillArray) {
    // console.debug({ fills }); 
    
    const pbd = new PositionBlocksMap();

    for (let i = 0; i < fills.length; i++) {
      const fill = fills[i];

      pbd.processFill(fill);
    }

    console.debug({ pbd });
  }
}
