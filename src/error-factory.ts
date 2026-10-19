export class GridArrError<
  K extends GridArrErrorCode = GridArrErrorCode,
> extends Error {
  public override readonly name = 'GridArrError';
  public readonly code: K;
  public readonly details: GridArrErrorDetails[K];
  constructor(
    ...[code, details]: GridArrErrorDetails[K] extends void
      ? [code: K, details?: undefined]
      : [code: K, details: GridArrErrorDetails[K]]
  ) {
    const messageFormatter = ERROR_MESSAGE[code] as (d: unknown) => string;
    super(messageFormatter(details));
    this.code = code;
    this.details = details as GridArrErrorDetails[K];
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**Defines the base error message identifier codes */
export const GridArrErrorCode = {
  UNEXPECTED_CONFIG_DATA: 'unexpected-config-data',
  INVALID_BUFFER_LENGTH: 'invalid-buffer-length',
  INVALID_GRID_DIMENSION: 'invalid-grid-dimension',
  EMPTY_DATA_PARAM: 'empty-data-param',
  INVALID_TYPE: 'invalid-type',
  OUT_OF_RANGE: 'out-of-range',
  INVALID_PARAM_COUNT: 'wrong-param-count',
  INVALID_CELL_COUNT: 'inorrect-cell-count',
  UNKNOWN: 'unknown',
} as const;
export type GridArrErrorCode =
  (typeof GridArrErrorCode)[keyof typeof GridArrErrorCode];

/**Maps expected/optional 'details' prop type for each base code*/
interface GridArrErrorDetails {
  [GridArrErrorCode.UNEXPECTED_CONFIG_DATA]: { data?: unknown };
  [GridArrErrorCode.INVALID_BUFFER_LENGTH]: {
    bufferLength: number;
    width: number;
  };
  [GridArrErrorCode.INVALID_GRID_DIMENSION]: {
    width?: number;
    height?: number;
  };
  [GridArrErrorCode.EMPTY_DATA_PARAM]: void;
  [GridArrErrorCode.INVALID_TYPE]: { type: string };
  [GridArrErrorCode.OUT_OF_RANGE]: {
    index?: number;
    coord?: { x: number; y: number };
  };
  [GridArrErrorCode.INVALID_PARAM_COUNT]: {
    expected: string | number;
    received: string | number;
  };
  [GridArrErrorCode.INVALID_CELL_COUNT]: {
    expected: string | number;
    received: string | number;
  };
  [GridArrErrorCode.UNKNOWN]: void;
}

/**Defines message formatter functions for each base code and its specific detail  type*/
const ERROR_MESSAGE: {
  [K in GridArrErrorCode]: (details: GridArrErrorDetails[K]) => string;
} = {
  [GridArrErrorCode.UNEXPECTED_CONFIG_DATA]: (d) =>
    `Unexpected config data encountered during grid construction : ${d ? JSON.stringify(d, null, 3) : ''}`,
  [GridArrErrorCode.INVALID_BUFFER_LENGTH]: (d) =>
    `Buffer length (${d.bufferLength}) must be cleanly divisible by provided width (${d.width}).`,
  [GridArrErrorCode.INVALID_GRID_DIMENSION]: (d) => {
    return `Grid dimesions must be positive integers, received:${d.width ? ` width:${d.width}` : ``}${d.height ? ` height:${d.height}` : ``}`;
  },
  [GridArrErrorCode.EMPTY_DATA_PARAM]: (d) => `Provided data param is empty`,
  [GridArrErrorCode.INVALID_TYPE]: (d) => `Unexpected type received: ${d.type}`,
  [GridArrErrorCode.OUT_OF_RANGE]: (d) => {
    if (d.index) return `Index (${d.index}) out of bounds.`;
    if (d.coord)
      return `Coordinates (${d.coord.x}, ${d.coord.y}) out of bounds.`;
    return `An unexpected range error occured`;
  },
  [GridArrErrorCode.INVALID_PARAM_COUNT]: (d) =>
    `Expected ${d.expected} arguments, but received ${d.received}.`,
  [GridArrErrorCode.INVALID_CELL_COUNT]: (d) =>
    `Parameter must be ${d.expected}, received: ${d.received}`,
  [GridArrErrorCode.UNKNOWN]: (d) => `An unknown error occured`,
};
