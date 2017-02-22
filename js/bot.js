const async = require('async');

let game;
let helper;

// per game
let moveNo;

// per round
let beginCells;
let beginRating;

const prepareRound = () => {
    beginCells = helper.clone(game.grid.cells);
    beginRating = helper.calculateRating(helper.serialize(beginCells));
};

const run = () => {
    moveNo = 0;
    async.whilst(() => {
        return !game.isGameTerminated();
    }, next => {
        prepareRound();




        next();
    });

    game.restart();
};

const simulateAndRank = directions => {
    const stateBefore = helper.clone(game.grid.serialize().cells);
    return directions.map(d => {
        let ratingIncreased = 0;
        game.move(d);
        if (helper.calculateRating(helper.serialize) > beginRating) {
            ratingIncreased = 1;
        }
        game.grid.cells = game.grid.fromState(stateBefore);

        return ratingIncreased;
    });
};

module.exports = (_game, _helper) => {
    game = _game;
    helper = _helper;

    return {
        run: run,
        _simulateAndRank : simulateAndRank
    };
};