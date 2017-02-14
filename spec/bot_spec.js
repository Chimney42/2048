const Bot = require('../js/bot.js');

fdescribe('A bot', () => {
    const game = {};
    const bot = new Bot(game);
    it('should initialize with the correct values', () => {
       expect(bot.moveNo).toBe(1);
       expect(bot.allowedDirections).toEqual([0, 1, 2, 3]);
       expect(bot.game).toBe(game);
    });
});