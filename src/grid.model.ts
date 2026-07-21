export interface DefaultCellData {
  x: number;
  y: number;
  index: number;
}

/**
 * Configured with a prepopulated array of data and the width of the grid
 */
export interface FilledArray<T = DefaultCellData> {
  data: T[];
  width: number;
}

/**
 * Configured with the width and height of the grid and an optional method to populate the cells
 */
export interface GridDimensions<T = DefaultCellData> {
  width: number;
  height: number;
  fill?: (index: number, x: number, y: number) => T;
}

/**
 * Cinfigured with the number of cells to create and the width of the grid
 */
export interface CellCount<T = DefaultCellData> {
  width: number;
  cellCount: number;
  fill?: (index: number, x: number, y: number) => T;
}

export type GridConfig<T = DefaultCellData> =
  FilledArray<T> | GridDimensions<T> | CellCount<T>;