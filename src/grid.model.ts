export interface DefaultCellData {
  x: number;
  y: number;
  index: number;
}

interface ConfigBase {
  wrap?: Wrap;
}

/**
 * Configured with a prepopulated array of data and the width of the grid
 */
export interface FilledArray<T = DefaultCellData> extends ConfigBase {
  data: T[];
  width: number;
}

/**
 * Configured with the width and height of the grid and an optional method to populate the cells
 */
export interface GridDimensions<T = DefaultCellData> extends ConfigBase {
  width: number;
  height: number;
  fill?: (index: number, x: number, y: number) => T;
}

/**
 * Cinfigured with the number of cells to create and the width of the grid
 */
export interface CellCount<T = DefaultCellData> extends ConfigBase {
  width: number;
  cellCount: number;
  fill?: (index: number, x: number, y: number) => T;
}

export type GridConfig<T = DefaultCellData> =
  FilledArray<T> | GridDimensions<T> | CellCount<T>;

export interface BufferAllocationResult<T> {
  data: T[];
  width: number;
  height: number;
}

export interface GridCoord {
  x: number;
  y: number;
}

export const Wrap = {
  NONE: 'none',
  BOTH: 'both',
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
} as const;
export type Wrap = (typeof Wrap)[keyof typeof Wrap];
