const GameManager = require('./game_manager');
const fs = require('fs');
const game = new GameManager(4);

// 0: up, 1: right, 2: down, 3: left
let getRandomDirection = () =>  {
    min = Math.ceil(0);
    max = Math.floor(3);
    return Math.floor(Math.random() * (max - min)) + min;
};

let serialize = (cells) => {
    let serializedState = [];
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

let getHighestTile = (cells) => {
    let highestValue = 0;
    for (let i = 0; i < cells.length; i++) {
        for (let x = 0; x < cells[i].length; x++) {
            if (cells[i][x] && highestValue < cells[i][x].value) {
                highestValue = cells[i][x].value;
            }
        }
    }
    return highestValue;
};
let gameStates = [];
let output = 'cell_1,cell_2,cell_3,cell_4,cell_5,cell_6,cell_7,cell_8,cell_9,cell_10,cell_11,cell_12,cell_13,cell_14,cell_15,cell_16,direction,highestTile,hasWon\n';

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
    gameStates.push(dataPoint);

    game.move(direction);
}
let hasWon = getHighestTile(game.grid.cells) >= 1024 ? 1 : 0;

gameStates.map((dataPoint) => {
    output += dataPoint.boardState.join(',')+','+dataPoint.direction+','+dataPoint.highestTile+','+hasWon+'\n';
});
fs.writeFile("train.csv", output);