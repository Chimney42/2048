const fs = require('fs');
const async = require('async');
const synaptic = require('synaptic');
const Network = synaptic.Network;
const nano = require('nano')('http://localhost:5984');
const trainingDb = nano.use('training');
const networkDb = nano.use('network');
const newDb = nano.use('training_first_iteration');
const GameManager = require('./game_manager');
const game = new GameManager(4);

let network = null;
// 0: left, 1: down, 2: right, 3: up
const allDirections = [0, 1, 2, 3];
let allowedDirections = [0, 1, 2, 3];

const getRandomDirection = () =>  {
    const min = 0;
    const max = allowedDirections.length - 1;
    let val = Math.floor(Math.random() * (max - min)) + min;
    return allowedDirections[val];
};

const getTrainedDirection = (input) => {
  let moveRatings = network.activate(input);
  console.log(moveRatings);
  let allowedMoveRatings = allowedDirections.map((dir) => {
    return moveRatings[dir];
  })
  let index = allowedMoveRatings.indexOf(Math.max.apply([], allowedMoveRatings));
  let direction = allowedDirections[index];
  console.log('moving to', direction);
  return direction;
}

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
networkDb.get('a6d282b8930e65bd3ee131c7e37c998e', (err, body) => {
  if (err) throw err;
  delete body._id;
  delete body._rev;
  network = Network.fromJSON(body);

  for (let i = 0; i < 1; i++) {
    let moveNo = 1;
    async.whilst(() => {
      return !game.isGameTerminated()
    }, (next) => {
      let oldState = JSON.parse(JSON.stringify(game.grid.serialize()));
      console.log(serialize(oldState.cells));
      rating = getRating(serialize(oldState.cells));

      let dataPoint = {
          boardState: serialize(game.grid.cells),
          moveNo: moveNo
      };
      let moveTo = getTrainedDirection([moveNo].concat(dataPoint.boardState));

      let moveRatings = allDirections.map((direction) => {
        let ratingIncreased = 0;
        game.move(direction);

        if (getRating(serialize(game.grid.cells)) > rating) {
          ratingIncreased = 1;
        }
        game.grid.cells = game.grid.fromState(oldState.cells);
        return ratingIncreased;
      });
      dataPoint.moveRatings = moveRatings;

      newDb.insert(dataPoint, (err, body) => {
        if (err) throw err;
        console.log(body);
        next();
      });
      game.move(moveTo);
      console.log(serialize(game.grid.cells));
      if (!game.moved) {
         allowedDirections.splice(allowedDirections.indexOf(moveTo), 1);
         console.log("BLACKLISTING DIR", moveTo);
      } else {
         allowedDirections = [0, 1, 2, 3];
      }

      moveNo++;
    });
    game.restart();
  }
})