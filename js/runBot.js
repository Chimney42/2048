const GameManager = require('./game_manager');
const fs = require('fs');
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

let output = 'moveNo,cell_1,cell_2,cell_3,cell_4,cell_5,cell_6,cell_7,cell_8,cell_9,cell_10,cell_11,cell_12,cell_13,cell_14,cell_15,cell_16,direction,highestTile,hasWon\n';
let games = [];
for (let i = 0; i < 100; i++) {
  let gameStates = [];
  let entireGame = [];
  let moveNo = 1;
  while(!game.isGameTerminated()) {
      let direction = getRandomDirection();
      let boardState = serialize(game.grid.cells);

      let dataPoint = {
          boardState: boardState,
          direction: direction,
          moveNo: moveNo
      };

      game.move(direction);

      if (!game.moved) {
          allowedDirections.splice(allowedDirections.indexOf(direction), 1);
          console.log("BLACKLISTING DIR", direction);
      } else {
          allowedDirections = [0, 1, 2, 3];
          moveNo++;
          dataPoint.highestTile = getHighestTile(game.grid.cells);

          console.log(dataPoint);
          gameStates.push(dataPoint);
      }
  }
  let hasWon = getHighestTile(game.grid.cells) >= 2048 ? 1 : 0;

  entireGame = gameStates.map((dataPoint) => {
      return dataPoint.moveNo+','+dataPoint.boardState.join(',')+','+dataPoint.direction+','+dataPoint.highestTile+','+hasWon;
  });
  games.push(entireGame.join('\n'));
  game.restart();
}
output += games.join('\n');
fs.writeFile("train.csv", output);
