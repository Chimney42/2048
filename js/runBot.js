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

const getRating = (boardState) => {
  let count = boardState.filter(item => item > 0).length;
  let sum = boardState.reduce((sum, item) => sum + item, 0);
  return sum / count;
};

//fs.writeFileSync("train_first_iteration_simulate_moves.csv",
//  'moveNo,cell_1,cell_2,cell_3,cell_4,cell_5,cell_6,cell_7,cell_8,cell_9,cell_10,cell_11,cell_12,cell_13,cell_14,cell_15,cell_16,direction,ratingIncreased\n'
//);
fs.writeFileSync('train_first_iteration_simulate_moves.json', '');

for (let i = 0; i < 1; i++) {
  let entireGame = [];
  let moveNo = 1;
  while(!game.isGameTerminated()) {
    let oldState = JSON.parse(JSON.stringify(game.grid.serialize()));
    rating = getRating(serialize(oldState.cells));
    let moveTo = getRandomDirection();

    let dataPoint = {
        boardState: serialize(game.grid.cells),
        moveNo: moveNo
    };

    let moveRankings = allowedDirections.map((direction) => {
      let ratingIncreased = 0;
      game.move(direction);
      if (getRating(serialize(game.grid.cells)) > rating) {
        ratingIncreased = 1;
        moveTo = direction;
      }
      game.grid.cells = game.grid.fromState(oldState.cells);
      return ratingIncreased;
    });

    entireGame.push({
      moveNo : dataPoint.moveNo,
      boardState : dataPoint.boardState,
      moveRankings : moveRankings});
    game.move(moveTo);
    moveNo++;
  };
  //console.log(gameStates);
  //entireGame = gameStates.map((dataPoint) => {
  //    return dataPoint.moveNo+','+dataPoint.boardState.join(',')+','+dataPoint.direction+','+dataPoint.ratingIncreased;
  //});
  console.log(entireGame);
  fs.appendFileSync('train_first_iteration_simulate_moves.json', JSON.stringify(entireGame));
  game.restart();
}
