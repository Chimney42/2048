describe("A bot", () => {
    const GameManager = require('../js/game_manager');
    const game = new GameManager(4);
    const helper = require('../js/helper.js')();
    const bot = require('../js/bot.js')(game, helper);

    const setup = () => {
        spyOn(game, 'isGameTerminated').and.returnValues(false, true);
        spyOn(game, 'move');
        spyOn(helper, 'serialize');
        spyOn(helper, 'clone').and.callThrough();
        spyOn(helper, 'calculateRating');
    };

    it('should restart if game is terminated', () => {
        setup();

        game.isGameTerminated.and.returnValue(true);
        spyOn(game, 'restart');

        bot.run();
        expect(game.isGameTerminated).toHaveBeenCalled();
        expect(game.restart).toHaveBeenCalled();
    });

    it('should clone the current boardstate', () => {
        setup();
        const cells = [[ null, { value: 2 }],
            [ null, null ]];
        game.grid.cells = cells;

        bot.run();

        expect(helper.clone).toHaveBeenCalledWith(cells);
    });

    it('should calculate rating from serialized boardState', () => {
        setup();
        const state = [0, 2, 0, 0];
        helper.serialize.and.returnValue(state);

        bot.run();

        expect(helper.calculateRating).toHaveBeenCalledWith(state);
    });

    it('should simulate the given moves and return the ratings', () => {
        setup();
        const directions = [0, 1];
        const beginCells = helper.clone(game.grid.serialize().cells);
        const rankings = bot._simulateAndRank(directions);

        expect(game.grid.cells).toEqual(game.grid.fromState(beginCells));
        expect(game.move).toHaveBeenCalledWith(directions[0]);
        expect(game.move).toHaveBeenCalledWith(directions[1]);
        expect(rankings).toEqual(jasmine.any(Array));
        expect(rankings.length).toBe(directions.length);
    })

});