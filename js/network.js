const helper = require('./helper.js')();
let network;


const getRandomDirection = allowedDirections => {
    const min = 0;
    const max = allowedDirections.length - 1;
    let val = Math.floor(Math.random() * (max - min)) + min;
    return allowedDirections[val];
};

const getTrainedDirection = (dataPoint, allowedDirections) => {
    const activation = [dataPoint.moveNo].concat(dataPoint.boardState);
    const predictions = network.activate(activation);

    const predForAllwdDirs = allowedDirections.map(direction => predictions[direction]);
    const highestProb = predForAllwdDirs.reduce((acc, prob) => {
        if (prob > acc) {
            return prob
        } else {
            return acc;
        }
    }, 0);
    const index = predForAllwdDirs.indexOf(highestProb);
    return allowedDirections[index];
};

module.exports = (_network) => {
        network = _network;
    return {
        getRandomDirection : getRandomDirection,
        getTrainedDirection : getTrainedDirection
    };
};