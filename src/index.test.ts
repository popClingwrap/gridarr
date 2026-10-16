import { describe, expect, it } from 'vitest';
import { GridArr } from './index.js';
import { Wrap } from './grid.model.js';
import { GridArrError, GridArrErrorCode } from './error-factory.js';

describe('GridArr constructor', () => {
  describe('GridDimensionsConfig config mode with default fill method', () => {
    it('should initialise width and height with default content', () => {
      const grid = new GridArr({ width: 4, height: 5 });
      expectGridBasics(grid, {
        expectedWidth: 4,
        expectedHeight: 5,
      });
      const sampleCoords = { x: 0, y: 0 };
      expectShapeAtCoord(
        grid,
        {
          index: 0,
          x: sampleCoords.x,
          y: sampleCoords.y,
        },
        sampleCoords
      );
    });
  });

  describe('GridDimensionsConfig config mode with explicit fill method', () => {
    it('should initialise width and height with "col x, row y"', () => {
      const grid = new GridArr<string>({
        width: 4,
        height: 5,
        fill: (i, x, y) => `col ${x}, row ${y}`,
      });

      expectGridBasics(grid, {
        expectedWidth: 4,
        expectedHeight: 5,
      });

      const sampleCoords = { x: 0, y: 0 };
      expectValueAtCoord(
        grid,
        `col ${sampleCoords.x}, row ${sampleCoords.y}`,
        sampleCoords
      );
    });
  });

  describe('FilledArrayConfig config mode with valid params', () => {
    it('should initialise a grid with the provided content when width / buffer length relationship is valid', () => {
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

  describe('FilledArrayConfig config mode with invalid params', () => {
    it('should fail when width / buffer length relationship is invalid', () => {
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

  describe('CellCount config mode with valid width and default fill method', () => {
    it('should initialise with default content', () => {
      const grid = new GridArr({ cellCount: 12, width: 4 });
      expect(grid).toBeDefined();
    });
  });

  describe('CellCount config mode with valid width and explicit fill method', () => {
    it('should initialise with "col x, row y"', () => {
      const grid = new GridArr({
        cellCount: 12,
        width: 4,
        fill: (i, x, y) => `col ${x}, row ${y}`,
      });
      expect(grid).toBeDefined();
    });
  });

  describe('CellCount config mode with invalid width and default fill method', () => {
    it('should fail to initialise with invalid width', () => {
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

describe('Grid initialisation', () => {
  it('should set width, height and buffer when initialised with GridDimensionsConfig', () => {
    const grid = new GridArr({ width: 5, height: 4 });
    expect(grid.width).toBe(5);
    expect(grid.height).toBe(4);
    expect(grid.bufferLength).toBe(20);
  });

  it('should set width, height and buffer when initialised with CellCount', () => {
    const grid = new GridArr({ cellCount: 20, width: 5 });
    expect(grid.width).toBe(5);
    expect(grid.height).toBe(4);
    expect(grid.bufferLength).toBe(20);
  });

  it('should set width, height and buffer when initialised with FilledArrayConfig', () => {
    const data = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    ];
    const grid = new GridArr({ width: 5, data });
    expect(grid.width).toBe(5);
    expect(grid.height).toBe(4);
    expect(grid.bufferLength).toBe(20);
  });
});

describe('Structural get methods', () => {
  it('Should return correct values from a grid instance', () => {
    const grid = new GridArr({ width: 4, height: 5 });
    expect(grid.height).toBe(5);
    expect(grid.width).toBe(4);
    expect(grid.bufferLength).toBe(20);
  });
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
      const grid = new GridArr({ width: 4, height: 4 });
      expect(() => {
        grid.set(-100, 0, { x: 269, y: 269, index: 269 });
      }).toThrow(RangeError);

      expect(() => {
        grid.set(2, 200, { x: 269, y: 269, index: 269 });
      }).toThrow(RangeError);
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
      it('should set the correct value for a valid index', () => {
        const grid = new GridArr({ width: 4, height: 4 });
        grid.setByIndex(5, { x: 22, y: 22, index: 22 });
        // grid.setByIndex(-1, { x: 69, y: 69, index: 69 });
        // grid.setByIndex(500, { x: 500, y: 500, index: 500 });
        expect(grid.getByIndex(5)).toStrictEqual({ x: 22, y: 22, index: 22 });
        expect(() => {
          grid.setByIndex(-1, { x: 69, y: 69, index: 69 });
        }).toThrow(RangeError);
        expect(() => {
          grid.setByIndex(500, { x: 69, y: 69, index: 69 });
        }).toThrow(RangeError);
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

function expectGridBasics<T>(
  grid: GridArr<T>,
  params: GridBasicValidationParams
) {
  expect(grid).toBeDefined();
  expect(grid.width).toBe(params.expectedWidth);
  expect(grid.height).toBe(params.expectedHeight);
  expect(grid.bufferLength).toBe(params.expectedWidth * params.expectedHeight);
  expect(grid.wrapMode).toBe(params.expectedWrapMode || Wrap.NONE);
}

function expectShapeAtCoord<T>(
  grid: GridArr<T>,
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
