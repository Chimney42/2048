const GameManager = require('../js/lib/game_manager');
const game = new GameManager(2);
const gameWrapper = require('../js/game.js')(game);

describe('A game', () => {
    it('should know whether it is terminated', () => {
        const isGameTerminated = true;
        spyOn(game, 'isGameTerminated').and.returnValue(isGameTerminated);

        expect(gameWrapper.isTerminated()).toBe(isGameTerminated);
        expect(game.isGameTerminated).toHaveBeenCalled();
    });

    it('should restart the game', () => {
        spyOn(game, 'restart');
        gameWrapper.restart();
        expect(game.restart).toHaveBeenCalled();
    });

    it('should provide the current state in a specific format', () => {
        const state = [0, 2, 0, 0];
        game.grid.cells = [[ null, { value: 2 }],
            [ null, null ]];
        const returnedState = gameWrapper.getBoardState();

        expect(returnedState).toEqual(state);
    });

    it('should provide the rating of the current boardState', () => {
        game.grid.cells = [[ null, { value: 2 }],
            [ { value: 2 }, null ]];
        const expRating = 2;

        expect(gameWrapper.getRating()).toBe(expRating);
    });

    it('should reset game to given board state', () => {
        game.grid.cells = [[ null, { value: 2 }],
            [ { value: 2 }, null ]];
        const state = [0, 2, 0, 0];

        gameWrapper.resetTo(state);
        expect(gameWrapper.getBoardState()).toEqual(state);
    });
});