const dbName = 'first_iteration';
const urlBase = 'http://localhost:8086/';

const writeToInflux = (dataPoint) => {
    $.post(urlBase+'write?db='+dbName, dataPoint)
};

const logGameScoreMeasurement = (gameCount, score) => {
    const dataPoint = 'gameScore,gameCount='+gameCount+' score='+score;
    writeToInflux(dataPoint);
};

const logActionMeasurement = (gameCount, reward, action) => {
    const dataPoint = 'action,gameCount='+gameCount+',direction='+action+' reward='+reward;
    writeToInflux(dataPoint);
};
