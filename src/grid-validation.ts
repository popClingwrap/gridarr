import { CellCount, DefaultCellData } from './grid.model.js';
import { FilledArray, GridConfig, GridDimensions } from './grid.model.js';

export class ConfigValidation {
  static validate<T = DefaultCellData>(config: GridConfig<T>) {
    if (this.configIsFilledArray(config))
      return this.validateFilledArray(config);
    if (this.configIsGridDimensions(config))
      return this.validateGridDimensions(config);
    if (this.configIsCellCount(config)) return this.validateCellCount(config);
  }

  //#region Config Type Checks
  private static configIsFilledArray<T>(
    config: GridConfig<T>
  ): config is FilledArray<T> {
    return 'data' in config && config.data !== undefined;
  }

  private static configIsGridDimensions<T>(
    config: GridConfig<T>
  ): config is GridDimensions<T> {
    return 'height' in config && config.height !== undefined;
  }

  private static configIsCellCount<T>(
    config: GridConfig<T>
  ): config is CellCount<T> {
    return 'cellCount' in config && config.cellCount !== undefined;
  }

  //#region Config Type Validators
  private static validateFilledArray<T>(config: FilledArray<T>) {
    this.validateWidthParam(config.width);
    this.validateDataParam(config.data, config.width);
  }

  private static validateGridDimensions<T>(config: GridDimensions<T>) {
    this.validateWidthParam(config.width);
    this.validateHeightParam(config.height);
    this.validateFillMethodParam(config.fill);
  }

  private static validateCellCount<T>(config: CellCount<T>) {
    this.validateCellCountParam(config.cellCount, config.width);
    this.validateWidthParam(config.width);
    this.validateFillMethodParam(config.fill);
  }

  //#region Config Type Param Validators
  private static validateWidthParam(width: number) {
    if (width <= 0 || !Number.isInteger(width)) {
      throw new Error(
        `Grid width must be a positive integer, received: ${width}`
      );
    }
  }

  private static validateHeightParam(height: number) {
    if (height <= 0 || !Number.isInteger(height)) {
      throw new Error(
        `Grid height must be a positive integer, received: ${height}`
      );
    }
  }

  private static validateDataParam<T>(data: T[], width: number) {
    if (data.length === 0) {
      throw new Error('Provided data array must not be empty.');
    }

    this.validateBufferDivisibility(data.length, width);
  }

  private static validateFillMethodParam(fill?: unknown) {
    if (fill !== undefined) {
      if (typeof fill !== 'function') {
        throw new TypeError(
          `Expected 'fill' option to be a function, but received type '${typeof fill}'.`
        );
      }

      if (fill.length > 3) {
        throw new Error(
          `The 'fill' function accepts at most 3 arguments (index, x, y), but received a function with ${fill.length} parameters.`
        );
      }
    }
  }

  private static validateCellCountParam(cellCount: number, width: number) {
    if (cellCount <= 0 || !Number.isInteger(cellCount)) {
      throw new Error(
        `Parameter cellCount must be a positive integer, received: ${cellCount}`
      );
    }

    this.validateBufferDivisibility(cellCount, width);
  }

  private static validateBufferDivisibility(
    bufferLength: number,
    width: number
  ) {
    if (bufferLength % width !== 0) {
      throw new Error(
        `Buffer length (${bufferLength}) must be cleanly divisible by provided width (${width}).`
      );
    }
  }
}
