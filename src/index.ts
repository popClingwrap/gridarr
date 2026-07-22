import { allocateBuffer } from './buffer-allocation.js';
import { ConfigValidation } from './grid-validation.js';
import { DefaultCellData, GridConfig } from './grid.model.js';

export class GridArr<T = DefaultCellData> {
  private _buffer: T[] = [];
  private _width: number;
  private _height: number;

  constructor(config: GridConfig<T>) {
    ConfigValidation.validate(config);

    const { data, width, height } = allocateBuffer(config);
    this._width = width;
    this._height = height;
    this._buffer = data;
  }

  //#region Getters & Setters
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  get bufferLength() {
    return this._buffer.length;
  }
}
