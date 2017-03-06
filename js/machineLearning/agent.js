simulateKeyPress = (key) => {
    const event = new KeyboardEvent('keydown', {key: key});
    document.dispatchEvent(event);
};

generateRandomKey = () => {
    return Math.floor(Math.random() * 4);
};


const updateMetadataInterval = 100;
calculateAvg = (arr) => {
    if (arr.length === 0) {
        return 0;
    }

    const sum = arr.reduce((acc, val) => {
        return acc + val.y;
    }, 0);
    return sum / arr.length;
};
const absoluteScores = [];
const averageScores = [];
let scoreChart;

plotGameMetadata = () => {
    absoluteScores.push({
        x: gameCount,
        y: gameManager.score
    });

    if (absoluteScores.length > updateMetadataInterval) {
        absoluteScores.shift();
    }

    averageScores.push({
        x: gameCount,
        y: calculateAvg(absoluteScores)
    });

    if (averageScores.length > updateMetadataInterval) {
        averageScores.shift();
    }

    scoreChart.render();
};

let rewardChart;
const absoluteRewards = [];

plotMoveMetadata = (reward) => {
    absoluteRewards.push({
        x: totalMoveCount,
        y: reward
    });

    if (absoluteRewards.length > updateMetadataInterval * 5) {
        absoluteRewards.shift();
    }

    rewardChart.render();
};

calculateRating = () => {
    const state = serializeState();
    const sum = state.reduce((acc, value) => acc + value, 0);
    const count = state.filter(val => val > 0).reduce((acc, value) => value ? acc + 1 : acc, 0);
    return sum / count;
};

calculateHighestTile = () => {
    const state = serializeState();
    return state.reduce((acc, val) => {
        return val > acc ? val : acc;
    }, 0)
};
const endMoveCounts = [];
let maxMoveCount = 0;
const minMoveCount = 0;
let highScore = 0;

normalize = (val, max, min) => (val - min) / (max - min);

calculateReward = (action) => {
    const lastRating = calculateRating();
    simulateKeyPress(action);
    let reward = calculateRating() - lastRating;
    const moveCountFactor = normalize(moveCount, maxMoveCount, minMoveCount);
    const scoreFactor = normalize(gameManager.score, gameManager.storageManager.getBestScore(), 0);
    const factor = (moveCountFactor * scoreFactor);
    reward = reward * factor;
    return reward;
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

const env = {};
env.getNumStates = () => {
    return 17;
};
env.getMaxNumActions = () => {
    return 4;
};
let agent;

const spec = {
    update : 'qlearn', // qlearn | sarsa
    gamma : 0.9, // discount factor, [0, 1)
    epsilon : 0.5, // initial epsilon for epsilon-greedy policy, [0, 1)
    alpha : 0.1, // value function learning rate
    experience_add_every : 5, // number of time steps before we add another experience to replay memory
    experience_size : 50000, // size of experience replay memory
    learning_steps_per_iteration : 100,
    //spec.tderror_clamp = 1.0; // for robustness
    num_hidden_units : 256 // number of neurons in hidden layer
};

let gameCount = 0;
let totalMoveCount = 0;
let moveCount = 0;

initiateLearning = () => {

    agent = agent || new RL.DQNAgent(env, spec);

    return setInterval(function () { // start the learning loop
        if (gameManager.over === false) {
            moveCount++;
            maxMoveCount = moveCount > maxMoveCount ? moveCount : maxMoveCount;
            totalMoveCount++;
            let state = [moveCount].concat(serializeState());
            const action = agent.act(state); // s is an integer, action is integer
            const reward = calculateReward(action);
            plotMoveMetadata(reward);
            agent.learn(reward); // the agent improves its Q,policy,model, etc.
        } else {
            gameCount++;
            endMoveCounts.push(moveCount);
            if (endMoveCounts.length > updateMetadataInterval) {
                endMoveCounts.shift();
            }
            moveCount = 0;
            plotGameMetadata();
            if (gameCount % 100 === 0) {
                const epsilon = agent.epsilon;
                agent.epsilon = epsilon / 2;
            }
            gameManager.restart();
        }

    }, 0);
};

let db = new PouchDB('http://localhost:5984/network');
let simulation;

$('#startSim').on('click', () => {

    scoreChart = new CanvasJS.Chart("scoreChart", {
        title: {
            text: "endscores"
        },
        data: [{
            type: "line",
            showInLegend: true,
            name: "absolute",
            dataPoints: absoluteScores
        },
            {
                type: "line",
                showInLegend: true,
                name: "average (last 100 games)",
                dataPoints: averageScores
            }],
    });
    scoreChart.render();

    rewardChart = new CanvasJS.Chart("rewardChart", {
        title: {
            text: "reward"
        },
        data: [{
            type: "line",
            showInLegend: true,
            name: "absolute",
            dataPoints: absoluteRewards
        }],
    });
    rewardChart.render();


    if (gameManager.over === false) {
        simulation = initiateLearning();
    } else {
        gameCount++;
        lastRatings.push(gameManager.score);
        gameManager.restart();
    }
});


$('#stopSim').on('click', () => {
    clearInterval(simulation);
});

$('#saveAgent').on('click', () => {
    const document = agent.toJSON();
    document._id = 'fourthIteration';
    db.get(document._id).then(function (doc) {
        document._rev = doc._rev;
        return db.put(document);
    }).catch(function (err) {
        db.put(document);
    });
});

$('#loadAgent').on('click', () => {
    const document = db.get('fourthIteration');
    agent = agent || new RL.DQNAgent(env, spec);
    agent = agent.fromJSON(document);
});

$('#resetScore').on('click', () => {
   gameManager.storageManager.setBestScore(0);
   gameManager.actuate();
});