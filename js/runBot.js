const Game = require('./game_manager');
const Bot = require('./bot.js');
const botHelper = require('./botHelper.js');

for (let i = 0; i < 1; i++) {
    const game = new Game(4);
    const bot = new Bot(game, botHelper);
    bot.run();
}
