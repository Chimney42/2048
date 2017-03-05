simulateKeyPress = (key) => {
    const event = new KeyboardEvent('keydown', { key: key});
    document.dispatchEvent(event);
};

generateRandomKey = () => {
    return Math.floor(Math.random() * 4);
};

const updateMetadataInterval = 10;
const lastScores = [];
calculateAvgScore = () => {
    if(lastScores.length === 0) {
        return 0;
    }

    if (lastScores.length >= updateMetadataInterval) {
        lastScores.shift();
    }
    const sum =  lastScores.reduce((acc, score) => {
        return acc + score;
    }, 0);

    return Math.floor(sum / lastScores.length);
};
simulateMove = (action) => {
    const lastScore = gameManager.score;
    simulateKeyPress(action);
    return gameManager.score - lastScore;
};

serializeState = () => {
    let boardState = [];
    gameManager.grid.serialize().cells.forEach(row => {
        row.forEach(cell => {
            const c = cell ? cell.value : 0;
            boardState.push(c);
        })
    });
    return boardState;
};

initiateLearning = () => {
    const env = {};
    env.getNumStates = () => {
        return 16;
    };
    env.getMaxNumActions = () => {
        return 4;
    };
    const spec = { alpha: 0.01 };
    const agent = new RL.DQNAgent(env, spec);

    return setInterval(function(){ // start the learning loop
        if (gameManager.over === false) {
            state = serializeState();
            const action = agent.act(state); // s is an integer, action is integer
            const reward = simulateMove(action);
            agent.learn(reward); // the agent improves its Q,policy,model, etc.
        } else {
            count++;
            lastScores.push(gameManager.score);
            if(count % updateMetadataInterval === 0) {
                $('#lastAvgScores').append('<div>'+calculateAvgScore()+'</div>');
            }
            gameManager.restart();
        }

    }, 0);
};


let count = 1;
let simulation;

$('#startSim').on('click', () => {
        if (gameManager.over === false) {
            simulation = initiateLearning();
        } else {
            count++;
            lastScores.push(gameManager.score);
            if(count % updateMetadataInterval === 0) {
                $('#lastAvgScores').append('<div>'+calculateAvgScore()+'</div>');
            }
            gameManager.restart();
        }
});

$('#stopSim').on('click', () => {
    clearInterval(simulation);
});