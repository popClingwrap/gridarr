import { allocateBuffer } from './buffer-allocation.js';
import { ConfigValidation } from './grid-validation.js';
import { DefaultCellData, GridConfig, GridCoord, Wrap } from './grid.model.js';

export class GridArr<T = DefaultCellData> {
  private _buffer: T[] = [];
  private _width: number;
  private _height: number;
  private _wrapMode: Wrap;

  constructor(config: GridConfig<T>) {
    ConfigValidation.validate(config);

    const { data, width, height } = allocateBuffer(config);
    this._width = width;
    this._height = height;
    this._buffer = data;
    this._wrapMode = config.wrap ?? Wrap.NONE;
  }

  /**
   * Converts an x/y coord on the 2D grid to an index within the 1D buffer.
   * Obeys wrapMode but does not perform checks for out-of-bounds coords where wrapMode allows such. Use get(x,y) if you need out-of-bound coords to return undefined.
   * @param x - The column index (0-based).
   * @param y - The row index (0-based).
   * @returns The 1D buffer index.
   */
  toIndex(x: number, y: number, wrapOverride?: Wrap) {
    const mode = wrapOverride ?? this._wrapMode;

    const wrapHoriz = mode === Wrap.HORIZONTAL || mode === Wrap.BOTH;
    const wrapVert = mode === Wrap.VERTICAL || mode === Wrap.BOTH;

    const nx = this.normalise(x, this._width, wrapHoriz);
    const ny = this.normalise(y, this._height, wrapVert);

    return ny * this._width + nx;
  }

  /**
   * Converts an index in the 1D buffer to an x/y coord on the 2D grid
   * * Does not perform checks for out-of-bounds coords. Use getByIndex(i) if you need out-of-bound indexes to return undefined.
   * @param i - The linear 1D buffer index.
   * @returns The `{ x, y }` grid coordinates
   */
  toCoord(i: number): GridCoord {
    return { x: i % this._width, y: Math.floor(i / this._width) };
  }

  /**
   * Safe getter using x/y coord, with bounds checking. Returns undefined if out of bounds.
   */
  get(x: number, y: number, wrapOverride?: Wrap): T | undefined {
    if (!this.isInBounds(x, y, wrapOverride)) return undefined;
    return this._buffer[this.toIndex(x, y, wrapOverride)];
  }

  /**
   * Safe getter using buffer index, with bounds checking. Returns undefined if out of bounds.
   */
  getByIndex(index: number): T | undefined {
    if (index < 0 || index >= this._buffer.length) return undefined;
    return this._buffer[index];
  }

  /**
   * Safe setter using x/y coord, with bounds checking. Throws RangeError if out of bounds.
   */
  set(x: number, y: number, value: T, wrapOverride?: Wrap): void {
    if (!this.isInBounds(x, y, wrapOverride)) {
      throw new RangeError(`Coordinates (${x}, ${y}) out of bounds.`);
    }
    this._buffer[this.toIndex(x, y, wrapOverride)] = value;
  }

  /**
   * Safe setter using x/y coord, with bounds checking. Throws RangeError if out of bounds.
   */
  setByIndex(index: number, value: T): void {
    if (!this.indexIsInBounds(index)) {
      throw new RangeError(`Index (${index}) out of bounds.`);
    }
    this._buffer[index] = value;
  }

  /**
   * Checks if the given (x, y) coordinate exists within grid boundaries.
   */
  isInBounds(x: number, y: number, wrapOverride?: Wrap): boolean {
    const mode = wrapOverride ?? this._wrapMode;

    const wrapHoriz = mode === Wrap.HORIZONTAL || mode === Wrap.BOTH;
    const wrapVert = mode === Wrap.VERTICAL || mode === Wrap.BOTH;

    const xValid = wrapHoriz || (x >= 0 && x < this._width);
    const yValid = wrapVert || (y >= 0 && y < this._height);

    return xValid && yValid;
  }

  /**
   * Checks if the given (x, y) coordinate exists within grid boundaries.
   */
  indexIsInBounds(index: number): boolean {
    return index >= 0 && index < this._buffer.length;
  }

  /**
   * Normalizes an individual coordinate axis based on whether wrapping is enabled.
   */
  normalise(val: number, max: number, shouldWrap: boolean) {
    return shouldWrap ? ((val % max) + max) % max : val;
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

  get wrapMode() {
    return this._wrapMode;
  }
}
