import { describe, expect, it } from 'vitest';
import { GridArr } from './index.js';
import { Wrap } from './grid.model.js';
import { GridArrError, GridArrErrorCode } from './error-factory.js';

describe('Init GridDimensionsConfig', () => {
  const sampleCoord = { x: 0, y: 0 };
  it.each([
    {
      fill: null,
      expect: {
        index: 0,
        x: sampleCoord.x,
        y: sampleCoord.y,
      },
      desc: 'default',
    },
    {
      fill: (i: number, x: number, y: number) => `col ${x}, row ${y}`,
      expect: `col ${sampleCoord.x}, row ${sampleCoord.y}`,
      desc: 'custom',
    },
  ])(`Using $desc fill`, ({ fill, expect }) => {
    const grid = fill
      ? new GridArr({ width: 4, height: 5, fill })
      : new GridArr({ width: 4, height: 5 });

    expectGridBasics(grid, {
      expectedWidth: 4,
      expectedHeight: 5,
    });

    expectShapeAtCoord(grid, expect, sampleCoord);
  });

  describe('With invalid dimensions', () => {
    it.each([
      { width: -1, height: 4, desc: 'invalid width' },
      { width: 4, height: -1, desc: 'invalid height' },
      { width: -1, height: -1, desc: 'invalid height/width' },
    ])(
      `Throws ${GridArrErrorCode.INVALID_GRID_DIMENSION} on $desc`,
      ({ width, height }) => {
        try {
          new GridArr<number>({ width, height });
          expect.fail(
            `Expected GridArrError [${GridArrErrorCode.INVALID_GRID_DIMENSION}] to be thrown but configuration was successful`
          );
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(GridArrError);
          const error = err as GridArrError;
          expect(error.code).toBe(GridArrErrorCode.INVALID_GRID_DIMENSION);
        }
      }
    );
  });
});

describe('Init FilledArrayConfig', () => {
  describe('with valid params', () => {
    it('initialises a grid with the provided content', () => {
      const arr = [1, 2, 3, 4, 5, 6, 12, 23, 34, 56, 100, 1000, -1, -2, -3, -4];
      const grid = new GridArr<number>({ data: arr, width: 4 });
      const sampleCoords = { x: 0, y: 0 };
      expectGridBasics(grid, {
        expectedWidth: 4,
        expectedHeight: 4,
      });

      expectValueAtCoord(grid, 1, sampleCoords);
    });
  });

  describe('with invalid buffer / width relationship', () => {
    it(`throws ${GridArrErrorCode.INVALID_BUFFER_LENGTH}`, () => {
      const data = [1, 2, 3, 4, 5, 6, 12, 23, 34, 56, 100, 1000, -1, -2];
      const width = 4;
      try {
        new GridArr<number>({ data, width });
        expect.fail(
          `Expected GridArrError [${GridArrErrorCode.INVALID_BUFFER_LENGTH}] to be thrown but configuration was successful`
        );
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(GridArrError);
        const error = err as GridArrError;
        expect(error.code).toBe(GridArrErrorCode.INVALID_BUFFER_LENGTH);
        expect(error.details).toEqual({ bufferLength: 14, width: 4 });
      }
    });
  });
});

describe('Init CellCount', () => {
  const sampleCoord = { x: 0, y: 0 };
  it.each([
    {
      fill: null,
      expect: {
        index: 0,
        x: sampleCoord.x,
        y: sampleCoord.y,
      },
      desc: 'default',
    },
    {
      fill: (i: number, x: number, y: number) => `col ${x}, row ${y}`,
      expect: `col ${sampleCoord.x}, row ${sampleCoord.y}`,
      desc: 'custom',
    },
  ])('using $desc fill', ({ fill, expect }) => {
    const grid = fill
      ? new GridArr({ width: 4, height: 5, fill })
      : new GridArr({ width: 4, height: 5 });

    expectGridBasics(grid, {
      expectedWidth: 4,
      expectedHeight: 5,
    });

    expectShapeAtCoord(grid, expect, sampleCoord);
  });

  describe('with invalid width', () => {
    it(`throws ${GridArrErrorCode.INVALID_BUFFER_LENGTH}`, () => {
      try {
        const grid = new GridArr({ cellCount: 12, width: 5 });
        expect.fail(
          `Expected GridArrError [${GridArrErrorCode.INVALID_BUFFER_LENGTH}] to be thrown but configuration was successful`
        );
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(GridArrError);
        const error = err as GridArrError;
        expect(error.code).toBe(GridArrErrorCode.INVALID_BUFFER_LENGTH);
        expect(error.details).toEqual({ bufferLength: 12, width: 5 });
      }
    });
  });
});

describe('get()', () => {
  it.each([
    {
      sampleCoord: { x: 1, y: 0 },
      expected: { index: 1, x: 1, y: 0 },
      gridWrap: null,
      tempWrap: null,
      desc: 'target in bounds, no wrapping',
    },
    {
      sampleCoord: { x: 0, y: 0 },
      expected: { index: 0, x: 0, y: 0 },
      gridWrap: Wrap.BOTH,
      tempWrap: null,
      desc: 'target in bounds, grid wrap both',
    },
    {
      sampleCoord: { x: -1, y: -1 },
      expected: { index: 15, x: 3, y: 3 },
      gridWrap: Wrap.BOTH,
      tempWrap: null,
      desc: 'negative XY target, grid wrap both',
    },
    {
      sampleCoord: { x: -1, y: -1 },
      expected: { index: 15, x: 3, y: 3 },
      gridWrap: null,
      tempWrap: Wrap.BOTH,
      desc: 'negative XY target, temp wrap both',
    },
  ])('returns for $desc', ({ sampleCoord, expected, gridWrap, tempWrap }) => {
    const grid = gridWrap
      ? new GridArr({ width: 4, height: 4, wrap: gridWrap })
      : new GridArr({ width: 4, height: 4 });

    tempWrap
      ? expect(grid.get(sampleCoord.x, sampleCoord.y, tempWrap)).toStrictEqual(
          expected
        )
      : expect(grid.get(sampleCoord.x, sampleCoord.y)).toStrictEqual(expected);
  });
  //TODO - Refactored to here. test error cases for get()
  // it.each([
  //   {
  //     sampleCoord: { x: -1, y: 0 },
  //     expected: { index: 3, x: 3, y: 0 },
  //     wrap: Wrap.BOTH,
  //     desc: 'negative X target, wrap both',
  //   },
  //   {
  //     sampleCoord: { x: 0, y: -1 },
  //     expected: { index: 12, x: 0, y: 3 },
  //     wrap: Wrap.BOTH,
  //     desc: 'negative Y target, wrap both',
  //   },
  //   {
  //     sampleCoord: { x: -1, y: -1 },
  //     expected: { index: 15, x: 3, y: 3 },
  //     wrap: Wrap.BOTH,
  //     desc: 'negative XY target, wrap both',
  //   },
  // ])('throws  for $desc', ({ sampleCoord, expected, wrap, desc }) => {
  //   const grid = wrap
  //     ? new GridArr({ width: 4, height: 4, wrap })
  //     : new GridArr({ width: 4, height: 4 });
  //   expectShapeAtCoord(grid, expected, sampleCoord);
  // });
});

describe('toIndex() conversion method', () => {
  it('should return correct index values for any coord - even out of bounds', () => {
    const grid = new GridArr({ width: 4, height: 5 });
    expect(grid.toIndex(0, 0)).toBe(0);
    expect(grid.toIndex(3, 1)).toBe(7);
    expect(grid.toIndex(2, 2)).toBe(10);
    expect(grid.toIndex(0, 4)).toBe(16);
  });
});

describe('toCoord() conversion method', () => {
  it('should return correct x/y GridCoord for any index - even out of bounds', () => {
    const grid = new GridArr({ width: 4, height: 5 });
    expect(grid.toCoord(0)).toStrictEqual({ x: 0, y: 0 });
    expect(grid.toCoord(7)).toStrictEqual({ x: 3, y: 1 });
    expect(grid.toCoord(10)).toStrictEqual({ x: 2, y: 2 });
  });
});

describe('get(x, y, wrapOverride?) and set(x, y, wrapOverride?) methods', () => {
  describe('get(x, y)', () => {
    it('should return the correct value for the supplied params', () => {
      const grid = new GridArr({ width: 4, height: 4 });
      expect(grid.get(0, 0)).toStrictEqual({ x: 0, y: 0, index: 0 });
      expect(grid.get(0, 0, Wrap.BOTH)).toStrictEqual({ x: 0, y: 0, index: 0 });
      expect(grid.get(4, 1, Wrap.HORIZONTAL)).toStrictEqual({
        x: 0,
        y: 1,
        index: 4,
      });
      expect(grid.get(4, 1, Wrap.VERTICAL)).toBe(undefined);
      expect(grid.get(2, 6, Wrap.BOTH)).toStrictEqual({
        x: 2,
        y: 2,
        index: 10,
      });
      expect(grid.get(-1, 0)).toBe(undefined);
      expect(grid.get(-1, 0, Wrap.HORIZONTAL)).toStrictEqual({
        x: 3,
        y: 0,
        index: 3,
      });
    });
  });

  describe('set(x, y)', () => {
    it('should set the supplied value at the correct index in the buffer', () => {
      const grid = new GridArr({ width: 4, height: 4 });
      grid.set(0, 0, { x: 69, y: 69, index: 69 });
      expect(grid.get(0, 0)).toStrictEqual({ x: 69, y: 69, index: 69 });
      grid.set(-1, -1, { x: 169, y: 169, index: 169 }, Wrap.BOTH);
      expect(grid.get(-1, -1, Wrap.BOTH)).toStrictEqual({
        x: 169,
        y: 169,
        index: 169,
      });
    });

    it('should throw an error on invalid coords', () => {
      try {
        const grid = new GridArr({ width: 4, height: 4 });
        grid.set(-100, 0, { x: 269, y: 269, index: 269 });
        expect.fail(
          `Expected GridArrError [${GridArrErrorCode.OUT_OF_RANGE}] to be thrown but get() was successful`
        );
      } catch (err: any) {
        expect(err).toBeInstanceOf(GridArrError);
        const error = err as GridArrError;
        expect(error.code).toBe(GridArrErrorCode.OUT_OF_RANGE);
      }

      try {
        const grid = new GridArr({ width: 4, height: 4 });
        grid.set(2, 200, { x: 269, y: 269, index: 269 });
        expect.fail(
          `Expected GridArrError [${GridArrErrorCode.OUT_OF_RANGE}] to be thrown but get() was successful`
        );
      } catch (err: any) {
        expect(err).toBeInstanceOf(GridArrError);
        const error = err as GridArrError;
        expect(error.code).toBe(GridArrErrorCode.OUT_OF_RANGE);
      }
    });
  });

  describe('get/set by index methods', () => {
    describe('getByIndex(i)', () => {
      it('should return the correct value for a valid index', () => {
        const grid = new GridArr({ width: 4, height: 4 });
        expect(grid.getByIndex(5)).toStrictEqual({ x: 1, y: 1, index: 5 });
        expect(grid.getByIndex(-1)).toBe(undefined);
        expect(grid.getByIndex(500)).toBe(undefined);
      });
    });

    describe('setByIndex(i)', () => {
      it('should throw an error on invalid index', () => {
        try {
          const grid = new GridArr({ width: 4, height: 4 });
          grid.setByIndex(5000, { x: 22, y: 22, index: 22 });
          expect.fail(
            `Expected GridArrError [${GridArrErrorCode.OUT_OF_RANGE}] to be thrown but setByIndex() was successful`
          );
        } catch (err: any) {
          expect(err).toBeInstanceOf(GridArrError);
          const error = err as GridArrError;
          expect(error.code).toBe(GridArrErrorCode.OUT_OF_RANGE);
        }
      });
    });
  });

  describe('isInBounds(x, y, wrap) method', () => {
    it.each([
      [0, 0, Wrap.NONE, true, 'top left corner'],
      [2, 2, Wrap.BOTH, true, 'mid grid'],
      [5, 0, Wrap.NONE, false, 'out of bounds on the horizontal'],
      [5, 0, Wrap.HORIZONTAL, true, 'wrap on the horizontal'],
      [2, 5, Wrap.VERTICAL, true, 'wrap on the vertical'],
      [-1, -1, Wrap.BOTH, true, 'negative value wrap on the both'],
    ])(
      'should return correct bool value for all coord/wrap combos',
      (x, y, mode, expected, description) => {
        const grid = new GridArr({ width: 4, height: 4 });
        expect(grid.isInBounds(x, y, mode)).toBe(expected);
      }
    );
  });

  describe('indexIsInBounds(index: number)', () => {
    it('should return correct bool for any valid buffer index', () => {
      const grid = new GridArr({ width: 4, height: 4 });
      expect(grid.indexIsInBounds(0)).toBe(true);
      expect(grid.indexIsInBounds(10)).toBe(true);
      expect(grid.indexIsInBounds(200)).toBe(false);
    });
  });

  describe('normalise(val: number, max: number, shouldWrap: boolean)', () => {
    it('should return the correct value, respecting wrapping', () => {
      const grid = new GridArr({ width: 4, height: 4 });
      expect(grid.normalise(2, 4, false)).toBe(2);
      expect(grid.normalise(2, 4, true)).toBe(2);
      expect(grid.normalise(5, 4, false)).toBe(5);
      expect(grid.normalise(5, 4, true)).toBe(1);
    });
  });

  // describe('row(i)');
});

function expectGridBasics(
  grid: GridArr<any>,
  params: GridBasicValidationParams
) {
  expect(grid).toBeDefined();
  expect(grid.width).toBe(params.expectedWidth);
  expect(grid.height).toBe(params.expectedHeight);
  expect(grid.bufferLength).toBe(params.expectedWidth * params.expectedHeight);
  expect(grid.wrapMode).toBe(params.expectedWrapMode || Wrap.NONE);
}

function expectShapeAtCoord(
  grid: GridArr<any>,
  expectedShape: any,
  sampleCoord: { x: number; y: number }
) {
  expect(grid.get(sampleCoord.x, sampleCoord.y)).toMatchObject(expectedShape);
}

function expectValueAtCoord<T>(
  grid: GridArr<T>,
  expectedvalue: any,
  sampleCoord: { x: number; y: number }
) {
  expect(grid.get(sampleCoord.x, sampleCoord.y)).toBe(expectedvalue);
}

interface GridBasicValidationParams {
  expectedWidth: number;
  expectedHeight: number;
  expectedWrapMode?: Wrap;
}
