const GameManager = require('./game_manager');

const game = new GameManager(4);

let allowedDirections = [0, 1, 2, 3];

// 0: up, 1: right, 2: down, 3: left
const getRandomDirection = () =>  {
    const min = 0;
    const max = allowedDirections.length - 1;
    let val = Math.floor(Math.random() * (max - min)) + min;
    return allowedDirections[val];
};

const serialize = (cells) => {
    const serializedState = [];
    for (let i = 0; i < cells.length; i++) {
        for (let x = 0; x < cells[i].length; x++) {
            if (cells[i][x] === null) {
                serializedState.push(0)
            } else {
                serializedState.push(cells[i][x].value)
            }
        }
    }
    return serializedState;
};

const reduceRow = (acc, tile) => acc.concat(tile && tile.value || 0);

const reduceCells = (acc, row) => acc.concat(row.reduce(reduceRow, []));

const getHighestTile = (cells) => {
    return Math.max.apply([], cells.reduce(reduceCells, []));
};

while(!game.isGameTerminated()) {
    let direction = getRandomDirection();
    let boardState = serialize(game.grid.cells);
    let highestTile = getHighestTile(game.grid.cells);

    let dataPoint = {
        boardState: boardState,
        direction: direction,
        highestTile: highestTile
    };
    console.log(dataPoint);

    game.move(direction);

    if (!game.moved) {
        allowedDirections.splice(allowedDirections.indexOf(direction), 1);
        console.log("BLACKLISTING DIR", direction);
    } else {
        allowedDirections = [0, 1, 2, 3];
    }

    console.log(allowedDirections);
}