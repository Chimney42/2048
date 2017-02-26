const network = require('../js/network.js')();
const helper = require('../js/helper.js')();
const game = require('../js/game.js')();
const bot = require('../js/bot.js')(game, network, helper);

describe("A bot", () => {
    const setup = () => {
        spyOn(game, 'isTerminated').and.returnValues(false, true);
        spyOn(game, 'getBoardState');
        spyOn(game, 'moveTo');
        spyOn(game, 'resetTo');
        spyOn(network, 'getTrainedDirection');
    };

    it('should restart if game is terminated without doing anything else', () => {
        setup();
        game.isTerminated.and.returnValue(true);
        spyOn(game, 'restart');

        bot.run();
        expect(game.isTerminated).toHaveBeenCalled();
        expect(game.restart).toHaveBeenCalled();
        expect(game.getBoardState).not.toHaveBeenCalled();
    });

    it('should generate a dataPoint', () => {
        setup();

        bot.run();
        expect(game.getBoardState).toHaveBeenCalled();
    });

    it('should simulate a move and return whether rating has increased', () => {
        setup();
        const direction = 1;
        const state = [0, 0, 2, 0];
        game.getBoardState.and.returnValue(state);
        spyOn(game, 'getRating').and.returnValues(2, 4);

        bot.run();

        expect(game.getRating.calls.count() % 2).toBe(0);
        expect(game.moveTo).toHaveBeenCalledWith(direction);
        expect(game.resetTo).toHaveBeenCalledWith(state);
    });

    it('should make an actual move with a random direction', () => {
        setup();
        const direction = 1;
        network.getTrainedDirection.and.returnValue(direction);

        bot.run();
        expect(game.moveTo.calls.argsFor(4)).toEqual([direction]);
    });

    it('should save the datapoint to trainingCouch', () => {
        setup();
        const boardState = [0, 2, 0, 0];
        const moveNo = 1;
        const moveRatings = [0, 1, 1, 0];

        const dataPoint = {
            boardState : boardState,
            moveNo : moveNo,
            moveRatings : moveRatings
        };
        game.getBoardState.and.returnValue(boardState);
        spyOn(game, 'getRating').and.returnValues(2,2, 2,4, 2,4, 2,2);
        spyOn(helper, 'saveToCouch').and.returnValue(Promise.resolve());

        bot.run();
        expect(helper.saveToCouch).toHaveBeenCalledWith(dataPoint);
    });
});
