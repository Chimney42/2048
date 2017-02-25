const game = require('../js/game.js')();
const bot = require('../js/bot.js')(game);

describe("A bot", () => {
    it('should restart if game is terminated', () => {
        spyOn(game, 'isTerminated').and.returnValue(true);
        spyOn(game, 'restart');

        bot.run();
        expect(game.isTerminated).toHaveBeenCalled();
        expect(game.restart).toHaveBeenCalled();
    });
});
