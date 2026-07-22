import {
  BufferAllocationResult,
  CellCount,
  FilledArray,
  GridConfig,
  GridDimensions,
} from './grid.model.js';
import {
  configIsCellCount,
  configIsFilledArray,
  configIsGridDimensions,
} from './type-guards.js';

export function allocateBuffer<T>(
  config: GridConfig<T>
): BufferAllocationResult<T> {
  if (configIsGridDimensions(config)) return createFromGridDimensions(config);
  if (configIsFilledArray(config)) return createFromFilledArray(config);
  if (configIsCellCount(config)) return createFromCellCount(config);

  throw new Error('Unexpected config data encountered');
}

function createFromGridDimensions<T>(config: GridDimensions<T>) {
  const total = config.width * config.height;
  const data = new Array<T>(total);

  const fillFn = config.fill ?? ((i, x, y) => ({ index: i, x, y }));

  for (let idx = 0; idx < total; idx++) {
    const x = idx % config.width;
    const y = Math.floor(idx / config.width);
    data[idx] = fillFn(idx, x, y) as T;
  }

  return { data, width: config.width, height: config.height };
}

function createFromFilledArray<T>(config: FilledArray<T>) {
  const data = [...config.data];
  return { data, width: config.width, height: data.length / config.width };
}

function createFromCellCount<T>(config: CellCount<T>) {
  const total = config.cellCount;
  const data = new Array<T>(total);

  const fillFn = config.fill ?? ((i, x, y) => ({ index: i, x, y }));

  for (let idx = 0; idx < total; idx++) {
    const x = idx % config.width;
    const y = Math.floor(idx / config.width);
    data[idx] = fillFn(idx, x, y) as T;
  }

  return { data, width: config.width, height: data.length / config.width };
}
