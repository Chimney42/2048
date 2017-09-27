const dbName = 'codetalks';
const urlBase = 'http://localhost:8086/';

const writeToInflux = (dataPoint) => {
    return new Promise((resolve, reject) => {
        $.post(urlBase+'write?db='+dbName, dataPoint, data => {
            resolve(data);
        });
    });
};

const logGameMeasurement = (gameCount, reward, score, moveCount) => {
    return new Promise((resolve, reject) => {
        const dataPoint = 'game,gameCount='+gameCount+' reward='+reward+',score='+score+',moveCount='+moveCount;
        writeToInflux(dataPoint)
            .then(resolve);
    });

};

const logActionMeasurement = (gameCount, action, reward) => {
    return new Promise((resolve, reject) => {
        const dataPoint = 'action,gameCount='+gameCount+',direction='+action+' reward='+reward;
        writeToInflux(dataPoint)
            .then(resolve);
    });
};
