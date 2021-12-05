import { TypeError } from "../errors/types.error";
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
  constructor(public sizeUnit: string) {
    super();
  }

  updateOrPush(fill: Fill) {
    // const ba = this.at(-1);

    // TODO
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
    this.get(fill.sizeUnit)?.updateOrPush(fill);
  }

  processFill(fill: Fill) {

    if (!this.has(fill.sizeUnit))
      this.createPositionBlocksBySizeUnit(fill.sizeUnit);

    this.fillPositionBlocks(fill);
  }
}

export class PositionBuilder {
  static buildPositions(fills: FillArray) {
    console.debug({ fills });
    
    const pbd = new PositionBlocksMap();

    for (let i = 0; i < fills.length; i++) {
      const fill = fills[i];

      pbd.processFill(fill);
    }
  }
}
