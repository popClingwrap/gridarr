import { GridArrError, GridArrErrorCode } from './error-factory.js';
import { CellCount, DefaultCellData } from './grid.model.js';
import {
  FilledArrayConfig,
  GridConfig,
  GridDimensionsConfig,
} from './grid.model.js';
import {
  configIsCellCount,
  configIsFilledArray,
  configIsGridDimensions,
} from './type-guards.js';

export class ConfigValidation {
  static validate<T = DefaultCellData>(config: GridConfig<T>) {
    if (configIsFilledArray(config)) return this.validateFilledArray(config);
    if (configIsGridDimensions(config))
      return this.validateGridDimensions(config);
    if (configIsCellCount(config)) return this.validateCellCount(config);
  }

  //#region Config Type Validators
  private static validateFilledArray<T>(config: FilledArrayConfig<T>) {
    this.validateWidthParam(config.width);
    this.validateDataParam(config.data, config.width);
  }

  private static validateGridDimensions<T>(config: GridDimensionsConfig<T>) {
    this.validateWidthParam(config.width);
    this.validateHeightParam(config.height);
    // this.validateFillMethodParam(config.fill);
  }

  private static validateCellCount<T>(config: CellCount<T>) {
    this.validateCellCountParam(config.cellCount, config.width);
    this.validateWidthParam(config.width);
    // this.validateFillMethodParam(config.fill);
  }

  //#region Config Param Validators
  private static validateWidthParam(width: number) {
    if (width <= 0 || !Number.isInteger(width)) {
      throw new GridArrError(GridArrErrorCode.INVALID_GRID_DIMENSION, {
        width,
      });
    }
  }

  private static validateHeightParam(height: number) {
    if (height <= 0 || !Number.isInteger(height)) {
      throw new GridArrError(GridArrErrorCode.INVALID_GRID_DIMENSION, {
        height,
      });
    }
  }

  private static validateDataParam<T>(data: T[], width: number) {
    if (data.length === 0) {
      throw new GridArrError(GridArrErrorCode.EMPTY_DATA_PARAM);
    }

    this.validateBufferDivisibility(data.length, width);
  }

  // private static validateFillMethodParam(fill?: unknown) {
  //   if (fill !== undefined) {
  //     if (typeof fill !== 'function') {
  //       throw new GridArrError(GridArrErrorCode.INVALID_TYPE, {
  //         type: typeof fill,
  //       });
  //     }

  //     if (fill.length > 3) {
  //       throw new GridArrError(GridArrErrorCode.INVALID_PARAM_COUNT, {
  //         expected: '<=3',
  //         received: fill.length,
  //       });
  //     }
  //   }
  // }

  private static validateCellCountParam(cellCount: number, width: number) {
    if (cellCount <= 0 || !Number.isInteger(cellCount)) {
      throw new GridArrError(GridArrErrorCode.INVALID_CELL_COUNT, {
        expected: '>0',
        received: cellCount,
      });
    }

    this.validateBufferDivisibility(cellCount, width);
  }

  private static validateBufferDivisibility(
    bufferLength: number,
    width: number
  ) {
    if (bufferLength % width !== 0) {
      throw new GridArrError(GridArrErrorCode.INVALID_BUFFER_LENGTH, {
        bufferLength,
        width,
      });
    }
  }
}
