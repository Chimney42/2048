const async = require('async');
const nano = require('nano')('http://localhost:5984');
const db = nano.use('training');

class Bot {
    constructor(game, botHelper) {
        this.moveNo = 1;
        this.game = game;
        this.botHelper = botHelper;

        // 0: left, 1: down, 2: right, 3: up
        this.allowedDirections = [0, 1, 2, 3];
    }

    run() {
        async.whilst(() => {
            return !this.game.isGameTerminated()
        }, (next) => {
            const oldState = JSON.parse(JSON.stringify(this.game.grid.serialize())).cells;
            const rating = this.botHelper.getRating(this.botHelper.serialize(oldState));
            let moveTo = this.botHelper.getRandomDirection();

            let dataPoint = {
                boardState: this.botHelper.serialize(oldState),
                moveNo: this.moveNo
            };
            dataPoint.moveRankings = this.allowedDirections.map((direction) => {
                let ratingIncreased = 0;
                this.game.move(direction);
                if (this.botHelper.getRating(this.botHelper.serialize(this.game.grid.cells)) > rating) {
                    ratingIncreased = 1;
                    moveTo = direction;
                }
                this.game.grid.cells = this.game.grid.fromState(oldState);
                return ratingIncreased;
            });
            console.log(dataPoint);

            db.insert(dataPoint, function(err, body) {
                if (err) throw err;
                console.log(body);
                next();
            });

            this.game.move(moveTo);
            this.moveNo++;
        });
        this.game.restart();
    }
}

module.exports = Bot;