const dbName = 'decayEpsilonRatSco';
const urlBase = 'http://localhost:8086/';

const writeToInflux = (dataPoint) => {
    return new Promise((resolve, reject) => {
        $.post(urlBase+'write?db='+dbName, dataPoint, data => {
            resolve(data);
        });
    });
};

const logGameMeasurement = (gameCount, reward, averageRewards, rating, averageRatings, score, averageScores, moveCount, averageMoves) => {
    return new Promise((resolve, reject) => {
        const dataPoint = 'game,gameCount='+gameCount+' reward='+reward+',averageReward='+averageRewards+',rating='+rating+',averageRating='+averageRatings+',score='+score+',averageScore='+averageScores+',moveCount='+moveCount+',averageMove='+averageMoves;
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
