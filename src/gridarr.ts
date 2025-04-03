/**
 * A generic class that represents an Array as a grid.
 * A Gridarr instance can contain any kind of data with items in the grid being wrapped in GridCell instances
 * @class GridArr
 * @example
 * //Creates a 3x3 grid populated with the numbers 1-9
 * const grid = new Gridarr<number>({
 *     items: [1,2,3,4,5,6,7,8,9],
 *     colCount: 3
 * })
 */
export class GridArr<T>{
    private _items:GridCell<T>[] = [];
    private _colCount:number = Number.POSITIVE_INFINITY;
    private _rowCount:number = 1;
    private overflowX:OverflowType = 'none';
    private overflowY:OverflowType = 'none';

    /**
     *
     * @param config
     */
    constructor(config:GridConfig<T>){
        config.items = config.items||[];

        this.overflowX = config.overflow||config.overflowX||this.overflowX;
        this.overflowY = config.overflow||this.overflowY||this.overflowY;

        if(config.colCount && config.rowCount){
            this._rowCount = config.rowCount;
            this._colCount = config.colCount;
        }
        else if(!config.colCount && !config.rowCount){
            this._rowCount = 1;
            this._colCount = config.items.length;
        }
        else if(config.colCount){
            if(config.items.length === 0) throw new Error(`Passing colCount without rowCount OR items results in an empty grid with zero dimensions.`);
            this._colCount = config.colCount;
            this._rowCount = Math.ceil(config.items.length/this._colCount);
        }
        else if(config.rowCount){
            if(config.items.length === 0) throw new Error(`Passing rowCount without colCount OR items results in an empty grid with zero dimensions.`);
            this._rowCount = config.rowCount;
            this._colCount = Math.ceil(config.items.length/this._rowCount);
        }

        const gridCellCount = this._colCount*this._rowCount;


        //Too few items to fill the grid and no filler function
        if(config.items && config.items.length < gridCellCount && !config.filler){
            throw new Error(`${config.items.length} items have been supplied to a grid with ${this._colCount*this._rowCount} cells. Please pass an items array and/or filler function.`)
        }

        //Force the supplied items array to be the correct length for the grid.
        //Excess items are discarded and empty spaces are filled with 'undefined'
        //undefined items will be overwritten by the filler function
        const sizedArr = config.items.slice(0, gridCellCount).concat(Array(Math.max(0, gridCellCount-config.items.length)).fill(undefined));
        this._items = sizedArr.map((item: T|GridCell<T>, n) => {
            const x = n % this._colCount;
            const y = Math.floor(n / this._colCount);

            if(item instanceof GridCell){
                // if(gridRefAssignment === 'inherit') return item as GridCell<T>;
                // else{
                //     item.gridRef = {x, y};
                    return item as GridCell<T>;
                // }
            }

            //Empty spaces added to pad the supplied items array are converted to a usable value by calling the supplied filler function
            if(item===undefined && config.filler){
                item = config.filler(x,y,n);
            }

            return new GridCell(
                item,
                {x, y},
                this,
                n
            )
        });
    }

    /**
     * Returns the GridCell instance located at aX:aY
     * If the supplied coord is outside the grid bounds it is overflowed based on the overflow settings of the grid.
     * A different overflow option can be passed to temporarily override the grid level setting.
     * @param aX - The X coord (grid column)
     * @param aY - The Y coor (grid row)
     * @param aOverflowX - An optional setting for how tyo treat X coords outside the grid
     * @param aOverflowY - An optional setting for how tyo treat Y coords outside the grid
     */
    cell(aX:number, aY:number, aOverflowX?:OverflowType, aOverflowY?:OverflowType){
        const {x,y} = this.convertToValidGridIdRef(aX, aY, aOverflowX, aOverflowY);
        if(x >= this._colCount || y >= this._rowCount) throw new Error(`Coordinate {${x}, ${y}} does not exist on this grid. Is wrapping set correctly?`)
        return this._items[y*this._colCount + x];
    }

    /**
     * Return an Array of GridCell instances corresponding to a single row of the grid
     * Overflow is not considered so values outside the grid bounds will throw an error
     * @param idx - A row index
     */
    row(idx:number){
        if(idx >= this._rowCount) throw new Error(`Row index ${idx} is out of bounds. Only ${this._rowCount} rows exist.`)
        return this._items.slice(idx*this._colCount, (idx+1)*this._colCount);
    }

    /**
     * Return an Array of GridCell instances corresponding to a single column of the grid.
     * Overflow is not considered so values outside the grid bounds will throw an error
     * @param idx - A col index
     */
    col(idx:number){
        if(idx >= this._colCount) throw new Error(`Col index ${idx} is out of bounds. Only ${this._rowCount} cols exist.`)
        return this._items.filter((item, idx)=>{
            return idx%this._colCount===0;
        });
    }

    /**
     * Returns an Array or GridCell instances corresponding to a sub-area of the grid.
     * Areas are described as rectangles with x,y,w,h parameters but overflow settings may mean the resulting cells are not absolute neighbours
     * @param aX - X (column) coord to base the area on
     * @param aY  Y (row) coord to base the area on
     * @param aWidth - The width of the area including the reference cell
     * @param aHeight - The width of the area including the reference cell
     * @param aOverflowX - An optional setting for how to treat X coords outside the grid
     * @param aOverflowY - An optional setting for how to treat Y coords outside the grid
     */
    area(aX:number, aY:number, aWidth:number, aHeight:number, aOverflowX?:OverflowType, aOverflowY?:OverflowType):GridCell<T>[]{
        aWidth = aWidth<0 ? aWidth+1 : aWidth-1;
        aHeight = aHeight<0 ? aHeight+1 : aHeight-1;

        const {x,y} = this.convertToValidGridIdRef(
            aX+Math.min(aWidth, 0),
            aY+Math.min(aHeight, 0),
            aOverflowX,
            aOverflowY
        );

        const c0 = this.cell(x,y);
        aWidth = Math.abs(aWidth);
        aHeight = Math.abs(aHeight);

        const temp:GridCell<T>[] = [];
        for(let r = 0; r <= aHeight; r++){
            for(let c = 0; c <= aWidth; c++){
                // console.log(r,c)
                temp.push(c0.relative(c,r, aOverflowX, aOverflowY));
            }
        }

        return temp;
    }

    /**
     * Applies overflow setting to a grid reference and returns the adjusted reference.
     * @param aX - X (column) coord to base the area on
     * @param aY - Y (row) coord to base the area on
     * @param aOverflowX - An optional setting for how tyo treat X coords outside the grid
     * @param aOverflowY - An optional setting for how tyo treat Y coords outside the grid
     */
    private convertToValidGridIdRef(aX:number, aY:number, aOverflowX?:OverflowType, aOverflowY?:OverflowType):GridRef{
        const tempOverflowX:OverflowType = aOverflowX||this.overflowX;
        const tempOverflowY:OverflowType = aOverflowY||aOverflowX||this.overflowY;

        let x = tempOverflowX === 'wrap' ? aX%this._colCount
            : tempOverflowX === 'constrain' ? clamp(aX, 0, this._colCount-1)
                : aX;
        let y = tempOverflowY === 'wrap' ? aY%this._rowCount
            : tempOverflowY === 'constrain' ? clamp(aY, 0, this._rowCount-1)
                : aY;

        x = x<0 ? this._colCount+x : x;
        y = y<0 ? this._rowCount+y : y;
        return {x,y};
    }

    /**
     * Returns the number of rows in the grid
     */
    get rowCount(){return this._rowCount}

    /**
     * Returns the number of columns in the grid
     */
    get colCount(){return this._colCount}

    /**
     * returns the Array of all cells in the grid
     */
    get cells(){return this._items}
}

/**
 * All items in a GridArr instance are wrapped in a GridCell during creation.
 * GridCell items are created by GridArr and there should be no need to manually create them
 */
class GridCell<T>{
    /**
     * @param _contents - The supplied data that is wrapped by this GridCell instance
     * @param _gridRef - Cell coord based on an origin of [0,0]
     * @param _grid - Reference to the parent grid
     * @param _listIndex - The index of this item within the base Array of all cells
     */
    constructor(
        private _contents:T,
        private _gridRef:GridRef,
        private _grid:GridArr<T>,
        private _listIndex:number
    ){}

    /**
     * Returns the GridCell instance found at a position in the grid relative to this one.
     * @param aX - Horizontal offset from the reference cell
     * @param aY - Vertical offset from the reference cell
     * @param aOverflowX - An optional setting for how to treat X coords outside the grid
     * @param aOverflowY - An optional setting for how to treat Y coords outside the grid
     */
    relative(aX:number, aY:number, aOverflowX?:OverflowType, aOverflowY?:OverflowType){
        return this._grid.cell(this._gridRef.x+aX, this._gridRef.y+aY, aOverflowX, aOverflowY);
    }

    /**
     * Returns a readonly copy of the cells x and y coords.
     */
    get gridRef(){
        const {x,y} = this._gridRef;//Return a copy so original can't be altered
        return {x,y}
    }

    /**
     * Returns the user supplied data item that is wrapped by this cell
     */
    get contents(){return this._contents}

    /**
     * Returns the index of this cell within the base array of the containing GridArr instance
     */
    get listIndex(){return this._listIndex}

    /**
     * Returns a reference to the GridArr instance that this cell is a part of.
     */
    get grid(){return this._grid}
}

/**
 * Options to pass to a new GridArr on creation
 */
type GridConfig<T> = {
    items?: T[]|GridCell<T>[];
    rowCount?: number;
    colCount?: number;
    overflowX?:OverflowType;
    overflowY?:OverflowType;
    overflow?:OverflowType;
    filler?:(col:number, row:number, idx:number)=>T
}

type OverflowType = 'none'|'wrap'|'constrain';

type GridRef = {
    x:number;
    y:number;
}

function clamp(n:number, a:number, b:number){
    return  Math.max(Math.min(n, b), a);
}

/**
 * A debugging tool that outputs a basic visualisation of grid data to the console.
 * If the target is a GridArr then it is dispalyed with row and column IDs.
 * If the target is a GridCell or Array of GridCells then the relevant cells in the logged grid are highlighted
 * If the target is a GridArr then cells can be highlighted by passing a second argument of an Array of GridCell or {x:y} Objects
 * @param target - The data to visualise
 * @param highlights - The cells to highlight if the target is a GridArr instance
 */
export function visualise(target:GridArr<any>|GridCell<any>|GridCell<any>[], highlights?:(GridCell<any>|GridRef)[]){
    //Set the grid based on whatever has been passed as a target
    const grid = target instanceof GridArr ? target
        : Array.isArray(target) ? target[0].grid
            : target.grid;

    //If no highlights are specified and the target is not a grid then assume the target itself is to be highlighted within its parent grid
    if(!highlights){
        if(target instanceof GridCell) highlights = [target];
        else if(Array.isArray(target)) highlights = target;
    }

    const rowIdMaxLength = (grid.rowCount-1).toString().length;
    const colIdMaxLength = (grid.colCount-1).toString().length;
    const cellIdMaxLength = (grid.cells.length-1).toString().length;
    const rowLeaderSpacer = ' ';//Spacer between row ID and first cell

    let headerBlankLeader = ''.padStart(rowIdMaxLength+rowLeaderSpacer.length, ' ');
    let headerIds = ' ';
    for(let a = 0; a < grid.colCount; a++){
        headerIds += a.toString().padStart(Math.max(colIdMaxLength+1, cellIdMaxLength+1), ' ');
    }

    console.log('\x1b[100m'+headerBlankLeader+headerIds+' \x1b[0m');
    for(let r = 0; r<grid.rowCount; r++){
        let str = '\x1b[100m '+`${r}`.padStart(rowIdMaxLength, ' ')+rowLeaderSpacer+'\x1b[0m';
        for(let c = 0; c < grid.colCount; c++){
            const highlight = highlights?.find(i=>{
                if(i instanceof GridCell)
                    return i.gridRef.x === c && i.gridRef.y === r;
                else
                    return i.x === c && i.y === r;
            });

            if(highlight) str += '\x1b[31m';
            str += grid.cell(c,r).listIndex.toString().padStart(cellIdMaxLength+1, ' ');
            if(highlight) str += '\x1b[0m';
        }

        console.log(str)
    }
}
