import { ConfigValidation } from './grid-validation.js';
import { DefaultCellData, GridConfig } from './grid.model.js';

export class GridArr<T = DefaultCellData> {
  constructor(config: GridConfig<T>) {
    ConfigValidation.validate(config);
  }
}
