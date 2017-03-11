const dbName = 'first_iteration';
const urlBase = 'http://localhost:8086/';

const writeToInflux = (dataPoint) => {
    return new Promise((resolve, reject) => {
        $.post(urlBase+'write?db='+dbName, dataPoint, data => {
            resolve(data);
        });
    });
};

const logGameScoreMeasurement = (gameCount, score) => {
    return new Promise((resolve, reject) => {
        const dataPoint = 'gameScore,gameCount='+gameCount+' score='+score;
        writeToInflux(dataPoint)
            .then(resolve);
    });

};

const logActionMeasurement = (gameCount, reward, action) => {
    return new Promise((resolve, reject) => {
        const dataPoint = 'action,gameCount='+gameCount+',direction='+action+' reward='+reward;
        writeToInflux(dataPoint)
            .then(resolve);
    });
};
