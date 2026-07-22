import { describe, expect, it } from 'vitest';
import { GridArr } from './index.js';

describe('GridArr constructor', () => {
  describe('GridDimensions config mode with default fill method', () => {
    it('should initialise width and height with default content', () => {
      const grid = new GridArr({ width: 4, height: 5 });
      expect(grid).toBeDefined();
    });
  });

  describe('GridDimensions config mode with explicit fill method', () => {
    it('should initialise width and height with default content', () => {
      const grid = new GridArr<string>({
        width: 4,
        height: 5,
        fill: (i, x, y) => `col ${x}, row ${y}`,
      });
      expect(grid).toBeDefined();
    });
  });

  describe('FilledArray config mode with valid params', () => {
    it('should initialise a grid with the provided content when width / buffer length relationship is valid', () => {
      const arr = [1, 2, 3, 4, 5, 6, 12, 23, 34, 56, 100, 1000, -1, -2, -3, -4];
      const grid = new GridArr<number>({ data: arr, width: 4 });
      expect(grid).toBeDefined();
    });
  });

  describe('FilledArray config mode with invalid params', () => {
    it('should fail when width / buffer length relationship is valid', () => {
      const data = [1, 2, 3, 4, 5, 6, 12, 23, 34, 56, 100, 1000, -1, -2];
      const width = 4;
      expect(() => new GridArr<number>({ data, width })).toThrowError(
        'Buffer length (14) must be cleanly divisible by provided width (4).'
      );
    });
  });

  describe('CellCount config mode with valid width and default fill method', () => {
    it('should initialise with default content', () => {
      const grid = new GridArr({ cellCount: 12, width: 4 });
      expect(grid).toBeDefined();
    });
  });

  describe('CellCount config mode with valid width and explicit fill method', () => {
    it('should initialise with default content', () => {
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
      expect(() => new GridArr({ cellCount: 12, width: 5 })).toThrowError(
        'Buffer length (12) must be cleanly divisible by provided width (5).'
      );
    });
  });
});

describe('Grid initialisation', () => {
  it('should set width, height and buffer when initialised with GridDimensions', () => {
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

  it('should set width, height and buffer when initialised with FilledArray', () => {
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
