# Class : GridArr\<T\>

A generic class that represents an Array as a grid.
A Gridarr instance can contain any kind of data with items in the grid being wrapped in GridArrCell instances

## Example Usage

**Creating a grid**   
This example creates a 3x3 grid with cells containing the digits 1 to 9.
```ts
const grid:GridArr = new Gridarr<number>({
    items: [1,2,3,4,5,6,7,8,9],
    colCount: 3
})
```

**Reading a cell value**   
This example retrieves that value of the top left cell from the grid we just created.
Each data item passed to the original grid is wrapped in a GridArrCell instance. To get the original value we use `.instance`
```ts
const cell:GridArrCell = grid.cell(0,0);
console.log(cell.contents);//1
```

# Grid Config
When creating a new Gridarr you should provide a config object to give your grid its initial properties.   
There are several available properties and not all are required for every grid.
```ts
type GridConfig<T> = {
    items?: T[]|GridArrCell<T>[];
    rowCount?: number;
    colCount?: number;
    overflowX?:string;
    overflowY?:string;
    overflow?:string;
    filler?:(col:number, row:number, idx:number)=>T
}
```

## items
An Array of data that forms the basis of the grid. Each item in the array will be wrapped in a GridArrCell instance.
```ts
const g = new GridArr<number>({
    items:[1,2,3,4,5,6,7,8,9]
})
```

## rowCount / colCount
These tell the grid what its dimensions should be. You can provide neither, one or both of these params to alter the shape and contents of your grid based on the length of the `items` array.

**Neither** - The grid will be 1 dimensional. Effectively a single row, so no different to the initial data.

**rowCount only** - The grid will contain the specified number of rows. The number of columns will be set to whatever is required to accommodate the provided data.   
This example specifies 3 rows. Because 9 divides into 3 the returned grid is 3x3.
```ts
const g = new GridArr<number>({
    items:[1,2,3,4,5,6,7,8,9],
    rowCount:3
})
``` 
**colCount only** - Behaves exactly as `rowcCount` above but specifies the number of columns and dynamically creates the rows to match.

**colCount & rowCount**
When both params are passed the grid will be exactly those dimensions.   
If the provided data array has more items than the specified grid has space for then it is clipped and the rightmost data are discarded.
In this example 11 items are passed in but the grid is locked to 3x3 so the 10 and 11 are lost.
```ts
const g = new GridArr<number>({
    items:[1,2,3,4,5,6,7,8,9,10,11],
    rowCount:3,
    colCount:3
})
``` 
**IMPORTANT NOTE**   
GridArr instances MUST be rectangular, all rows must be the same length, all columns must be the same length and every cell must have some content.   
If the array you provide does not have enough items to fill every cell of the grid you specify then you must provide a filler method to populate the additional cells.   
See the `filler` property below for examples and more details on this.

## overflowX / overflowY / overflow
Overflow specifies how to deal with coordinates that fall outside the absolute boundaries of a grid e.g requesting a cell from the 4th row of a grid that only has 3 rows.   
**overflowX** - Specifies how overflow is dealt with on the x axis, when moving between columns.

**overflowY** - Specifies how overflow is dealt with on the y axis, when moving between rows.

**overflow** - A shorthand way to set both `overflowX` and `overflowY` to the same value.

Overflow can have one of three values.

**`none` default** - No overflow is allowed. Requests for cells at coordinates outside the range of the grid will result in an error being thrown.

**`wrap`** - Wraps the coordinate around to the opposite edge of the grid.   
With this set a request for the fourth row of a three row grid will return the first row, a request for the fifth will return the second etc.

**`constrain`** - Locks the coordinate to the closest edge cell of the grid.   
With this set a request for the fourth row of a three row grid will return the third row as will requests for any index greater than the available width.

## filler
GridArr instances MUST be rectangular, all rows must be the same length, all columns must be the same length and every cell must have some content.

In this example 8 items are passed and rowCount is set to 3.   
Because 8 does not divide into 3 cleanly so the best that could be returned would be a 3x3 grid with a single empty cell to complete the final row.
```ts
const g = new GridArr<number>({
    items:[1,2,3,4,5,6,7,8],
    rowCount:3
})
``` 
Empty cells are not allowed on GridArr instances to avoid the error that the above example would result in a filler method is passed that populates any empty cells that might be required to complete the grid.   
The `filler` param is a method that receives the column number, row number, and array index of the cell being populated and returns a value that will be the content of that cell.   
In this example the filler simply returns the array index of the item multiplied by 10.   
The result will be the same 3x3 grid as before but the bottom right cell will now contain `70` as its content.
```ts
const g = new GridArr<number>({
    items:[1,2,3,4,5,6,7,8],
    rowCount:3,
    filler:(row,col,idx)=>idx*10
})
``` 
A filler can be used to populate an entire grid instead of passing the `items` array.   
This example returns a 5x3 grid with each cell containing a number from 0 to 14.
```ts
const g = new GridArr<number>({
    rowCount:5,
    colCount:3,
    filler:(row,col,idx)=>idx
})
``` 
# GridArr methods

## `cell(x:number, y:number, aOverflowX?:string, aOverflowY?:string) :GridArrCell<T>`
Takes a column id (x) and a row id (y) and returns the `GridArrCell` from that location.   
The optional overflow params allow for a particular call to override the overflow setting of the grid. If left undefined the grid setting will always be used.

## `col(idx:number) :GridArrCell<T>[]`
Takes a column id and returns an Array of the cells that make up that column.

## `row(idx:number) :GridArrCell<T>[]`
Takes a row id and returns an Array of the cells that make up that column.

## `area(x:number,y:number,w:number,h:number) :GridArrCell<T>[]`
The params describe a rectangular area of the grid. This rectangle starts at the cell at coordinates {`x`,`Y`}, is `w` cells wide and `y` cells high.   
The optional overflow params allow for a particular call to override the overflow setting of the grid. If left undefined the grid setting will always be used.

# `GridArr properties`

## `colCount :number`
Returns the number of columns in the grid

## `rowCount :number`
Returns the number of rows in the grid

## `cells :GridArrCell<T>[]`

# Class : GridArrCell<T>
All grids are made up of GridArrCell instances. When you pass contents to a grid, either via the `items` config param or via a `filler` function, that contants is wrapped in a GridArrCell.   
The GridArrCell simply adds some properties that make mutating the grid easier internally.   
**NOTE** - You should never need to manually create a GridArrCell

# GridArrCell methods
## `relativex(x:number,y:number,w:number,h:number) :GridArrCell<T>`
Takes a column offset (x) and a row offset (y) and calculates a location relative to the calling GridArrCell. The GridArrCell at this new location is returned.   
The optional overflow params allow for a particular call to override the overflow setting of the grid. If left undefined the grid setting will always be used.

#GridArrCell properties

## gridRef
Returns an Object shaped as `{x:number;y:number}` that is the calling cell's position within the parent grid.

## contents
Returns the original value passed in to the cell on creation

## listIndex
Returns the index of this GridArrCell in the base Array that the parent grid is based on. This is equivalent to counting the cells right to left, from top left to bottom right

## grid
Returns the GridArr instance of which the calling cell is a child.

# Utilities

## `visualise(target, highlights?)`
A debugging method that renders a basic visualisation of grid elements in the console.   
If the target is a GridArr then it is dispalyed with row and column IDs.
If the target is a GridArrCell or Array of GridCells then the relevant cells in the logged grid are highlighted
If the target is a GridArr then cells can be highlighted by passing a second argument of an Array of GridArrCell or {x:y} Objects
