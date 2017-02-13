const Bot = require('../js/bot.js');

describe('A bot', () => {
    const bot = new Bot();
    it('should initialize with the correct values', () => {
       expect(bot.moveNo).toBe(1);
       expect(bot.allowedDirections).toEqual([0, 1, 2, 3])
    });
});