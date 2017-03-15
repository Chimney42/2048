const dbName = 'rating';
const urlBase = 'http://localhost:8086/';

const writeToInflux = (dataPoint) => {
    return new Promise((resolve, reject) => {
        $.post(urlBase+'write?db='+dbName, dataPoint, data => {
            resolve(data);
        });
    });
};

const logGameMeasurement = (gameCount, score, moveCount, reward) => {
    return new Promise((resolve, reject) => {
        const dataPoint = 'game,gameCount='+gameCount+' score='+score+',reward='+reward+',moveCount='+moveCount;
        writeToInflux(dataPoint)
            .then(resolve);
    });

};

const logActionMeasurement = (gameCount, action) => {
    return new Promise((resolve, reject) => {
        const dataPoint = 'action,gameCount='+gameCount+',direction='+action+' value=1';
        writeToInflux(dataPoint)
            .then(resolve);
    });
};
