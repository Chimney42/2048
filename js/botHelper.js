const allowedDirections = [0, 1, 2, 3];
const getRandomDirection = () => {
    const min = 0;
    const max = allowedDirections.length - 1;
    let val = Math.floor(Math.random() * (max - min)) + min;
    return allowedDirections[val];
};

const getRating = boardState => {
    let count = boardState.filter(item => item > 0).length;
    let sum = boardState.reduce((sum, item) => sum + item, 0);
    return sum / count;
};

const serialize = cells => {
    const serializedState = [];
    for (let i = 0; i < cells.length; i++) {
        for (let x = 0; x < cells[i].length; x++) {
            if (cells[i][x] === null) {
                serializedState.push(0)
            } else {
                serializedState.push(cells[i][x].value)
            }
        }
    }
    return serializedState;
};

module.exports = {
    getRandomDirection : getRandomDirection,
    getRating : getRating,
    serialize : serialize
};