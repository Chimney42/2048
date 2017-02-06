const async = require('async');
const nano = require('nano')('http://localhost:5984');
const db = nano.use('training');
const GameManager = require('./game_manager');
const game = new GameManager(4);
// 0: left, 1: down, 2: right, 3: up
const allowedDirections = [0, 1, 2, 3];

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

for (let i = 0; i < 1; i++) {
  let moveNo = 1;
  async.whilst(() => {
    return !game.isGameTerminated()
  }, (next) => {
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


    dataPoint.moveRankings = moveRankings;
    console.log(dataPoint);

    db.insert(dataPoint, function(err, body) {
      if (err) throw err;
      console.log(body);
      next();
    });

    game.move(moveTo);
    moveNo++;
  });
  game.restart();
}
