const async = require('async');
let helper;
let network;
let game;
const allDirections = [0, 1, 2, 3];
let allowedDirections;
let moveNo;

const run = () => {
    allowedDirections = allDirections.slice();
    moveNo = 1;
    async.whilst(() => {
        return !game.isTerminated();
    }, next => {
        const dataPoint = generateDatapoint();
        dataPoint.moveRatings = allDirections.map(simulateAndRate);

        const direction = network.getRandomDirection(allowedDirections);
        game.moveTo(direction);

        if (!game.hasStateChanged()) {
            allowedDirections.splice(allowedDirections.indexOf(direction), 1);
        } else {
            allowedDirections = allDirections.slice();
        }

        helper.saveToCouch(dataPoint)
            .then(() => {
                next();
            });
    });
    game.restart();
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
    game = _game || require('./game.js');
    network = _network || require('./network.js');
    helper = _helper || require('./helper.js')();

    return {
        run : run,
        allowedDirections : allowedDirections
    };
};