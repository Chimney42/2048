const async = require('async');
const nano = require('nano')('http://localhost:5984');
const db = nano.use('training');
const GameManager = require('./game_manager');
const game = new GameManager(4);
const botHelper = require('./botHelper.js');
// 0: left, 1: down, 2: right, 3: up
const allowedDirections = [0, 1, 2, 3];

for (let i = 0; i < 1; i++) {
  let moveNo = 1;
  async.whilst(() => {
    return !game.isGameTerminated()
  }, (next) => {
    let oldState = JSON.parse(JSON.stringify(game.grid.serialize()));
    const rating = botHelper.getRating(serialize(oldState.cells));
    let moveTo = botHelper.getRandomDirection();

    let dataPoint = {
        boardState: serialize(oldState.cells),
        moveNo: moveNo
    };
      dataPoint.moveRankings = allowedDirections.map((direction) => {
          let ratingIncreased = 0;
          game.move(direction);
          if (botHelper.getRating(serialize(game.grid.cells)) > rating) {
            ratingIncreased = 1;
            moveTo = direction;
          }
          game.grid.cells = game.grid.fromState(oldState.cells);
          return ratingIncreased;
    });
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
