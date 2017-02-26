let game;

const serialize = gameGrid => {
    let boardState = [];
    gameGrid.forEach(row => {
        row.forEach(cell => {
            const c = cell ? cell.value : 0;
            boardState.push(c);
        })
    });
    return boardState;
};

const deserialize = boardState => {
    let gameGrid = [];
    let i = 0;

    for (let x = 0; x < game.grid.size; x++) {
        let row = [];
        for (let y = 0; y < game.grid.size; y++) {
            let tile = null;
            if (boardState[i]) {
                tile = {
                    position : { x:x, y:y },
                    value : boardState[i]
                }
            }
            row.push(tile);
            i++;
        }
        gameGrid.push(row);
    }

    return gameGrid;
};

const calculateRating = boardState => {
    let count = 0;
    const sum = boardState.reduce((acc, cell) => {
        count += cell ? 1 : 0;
        return acc + cell;
    }, 0);

    return sum/count;
};


const isTerminated = () => game.isGameTerminated();
const hasStateChanged = () => game.moved;
const getBoardState = () => serialize(game.grid.cells);
const getRating = () => calculateRating(serialize(game.grid.cells));
const restart = () => {
    game.restart();
};
const moveTo = (direction) => {
    game.move(direction);
};
const resetTo = state => {
    game.grid.cells = game.grid.fromState(deserialize(state));
};



module.exports = (_game) => {
    if (!_game) {
        const GameManager = require('./lib/game_manager');
        _game = new GameManager(4);
    }
    game = _game;

    return {
        isTerminated : isTerminated,
        getBoardState : getBoardState,
        getRating : getRating,
        resetTo : resetTo,
        restart : restart,
        moveTo : moveTo,
        hasStateChanged : hasStateChanged
    }
};