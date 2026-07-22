import {
  CellCount,
  FilledArray,
  GridConfig,
  GridDimensions,
} from './grid.model.js';

export function configIsFilledArray<T>(
  config: GridConfig<T>
): config is FilledArray<T> {
  return 'data' in config && config.data !== undefined;
}

export function configIsGridDimensions<T>(
  config: GridConfig<T>
): config is GridDimensions<T> {
  return 'height' in config && config.height !== undefined;
}

export function configIsCellCount<T>(
  config: GridConfig<T>
): config is CellCount<T> {
  return 'cellCount' in config && config.cellCount !== undefined;
}
