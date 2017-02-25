const async = require('async');
let game;

const run = () => {
    async.whilst(() => {
        !game.isTerminated();
    }, next => {

    });
    game.restart();
};


module.exports = _game => {
    game = _game || require('./game.js');

    return {
        run : run
    };
};