const GameManager = require('./game_manager');

const game = new GameManager(4);

console.log(game.isGameTerminated());

console.log(game.grid.cells);

// 0: up, 1: right, 2: down, 3: left
game.move(2);

console.log(game.grid.cells);

game.move(1);

console.log(game.grid.cells);
