const getRandomDirection = allowedDirections => {
    const min = 0;
    const max = allowedDirections.length - 1;
    let val = Math.floor(Math.random() * (max - min)) + min;
    return allowedDirections[val];
};

module.exports = {
    getRandomDirection : getRandomDirection,
};