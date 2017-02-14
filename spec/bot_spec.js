const Bot = require('../js/bot.js');
const Game = require('../js/game_manager');
const botHelper = require('../js/botHelper.js');

describe('A bot', () => {
    let game;
    let bot;
    let gridSpy;
    let fakeCells;
    const setup = () => {
        game = new Game(4);
        bot = new Bot(game, botHelper);
        fakeCells = [{value: 1}, null];

        gridSpy = jasmine.createSpyObj('grid', ['serialize', 'eachCell', 'cellContent', 'fromState']);
        gridSpy.serialize.and.returnValue({cells: fakeCells});
        game.grid = gridSpy;
        spyOn(game, 'move');

        spyOn(botHelper, 'serialize');
        spyOn(botHelper, 'getRating');
        spyOn(botHelper, 'getRandomDirection');
    };

    it('should initialize with the correct values', () => {
        setup();
        expect(bot.moveNo).toBe(1);
        expect(bot.allowedDirections).toEqual([0, 1, 2, 3]);
        expect(bot.game).toBe(game);
    });

    it('should get information at the start of the move', () => {
        setup();
        const rv = {'return': 'value'};
        botHelper.serialize.and.returnValue(rv);

        bot.run();
        expect(gridSpy.serialize).toHaveBeenCalled();
        expect(botHelper.serialize).toHaveBeenCalledWith(fakeCells);
        expect(botHelper.getRating).toHaveBeenCalledWith(rv);
        expect(botHelper.getRandomDirection).toHaveBeenCalled();
    });

    it('should not get information if game was terminated', () => {
        setup();
        spyOn(game, 'isGameTerminated').and.returnValue(true);

        bot.run();
        expect(gridSpy.serialize).not.toHaveBeenCalled();
    })
});