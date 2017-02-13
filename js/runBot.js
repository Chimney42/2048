const GameManager = require('./game_manager');
const Bot = require('./bot.js');

for (let i = 0; i < 1; i++) {
    const game = new GameManager(4);
    const bot = new Bot(game);
    bot.run();
}
