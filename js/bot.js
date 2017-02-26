const async = require('async');
let helper;
let network;
let game;
const allDirections = [0, 1, 2, 3];
let allowedDirections;
let moveNo;

const run = _iterations => {
    const iterations = _iterations || 1;

    const runGame = function(i) {
        allowedDirections = allDirections.slice();
        moveNo = 1;

        if (i===0) {
            return;
        }
        i--;

        async.whilst(() => {
            return !game.isTerminated();
        }, next => {
            const dataPoint = generateDatapoint();
            dataPoint.moveRatings = allDirections.map(simulateAndRate);

            const direction = network.getTrainedDirection(dataPoint, allowedDirections);
            game.moveTo(direction);

            if (!game.hasStateChanged()) {
                allowedDirections.splice(allowedDirections.indexOf(direction), 1);
            } else {
                allowedDirections = allDirections.slice();
            }
            helper.saveToCouch(dataPoint)
                .then(() => {
                    console.log('saved datapoint', dataPoint);
                    moveNo++;
                    next();
                });
        }, () => {
            game.restart();
            runGame(i);
        });
    };

    runGame(iterations);
};

const generateDatapoint = () => {
    return {
        boardState : game.getBoardState(),
        moveNo : moveNo
    }
};

const simulateAndRate = direction => {
    const stateBefore = game.getBoardState();
    const ratingBefore = game.getRating();

    game.moveTo(direction);

    const ratingAfter = game.getRating();

    game.resetTo(stateBefore);
    return ratingAfter > ratingBefore ? 1 : 0;
};


module.exports = (_game, _network, _helper) => {
    network = _network || require('./network.js')();
    game = _game || require('./game.js')();
    helper = _helper || require('./helper.js')();

    return {
        run : run
    };
};