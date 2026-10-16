import {
  CellCount,
  FilledArrayConfig,
  GridConfig,
  GridDimensionsConfig,
} from './grid.model.js';

export function configIsFilledArray<T>(
  config: GridConfig<T>
): config is FilledArrayConfig<T> {
  return 'data' in config && config.data !== undefined;
}

export function configIsGridDimensions<T>(
  config: GridConfig<T>
): config is GridDimensionsConfig<T> {
  return 'height' in config && config.height !== undefined;
}

export function configIsCellCount<T>(
  config: GridConfig<T>
): config is CellCount<T> {
  return 'cellCount' in config && config.cellCount !== undefined;
}
