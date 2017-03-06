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

    return Math.floor(sum / arr.length);
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
const averageRewards = [];
let lastAvgReward = 0;

plotMoveMetadata = (reward) => {
    absoluteRewards.push({
        x: totalMoveCount,
        y: reward
    });

    if (absoluteRewards.length > updateMetadataInterval) {
        absoluteRewards.shift();
    }

    const rewardDiff = reward - lastAvgReward;
    lastAvgReward = lastAvgReward + (rewardDiff / totalMoveCount);
    averageRewards.push({
        x: totalMoveCount,
        y: lastAvgReward
    });

    if (averageRewards.length > updateMetadataInterval) {
        averageRewards.shift();
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

simulateMove = (action) => {
    const lastRating = calculateRating();
    simulateKeyPress(action);
    let reward = calculateRating() - lastRating;
    if (gameManager.over == true) {
        reward = reward * reward;
        if (!gameManager.won) {
            reward = reward * -1;
        }
    }

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

let gameCount = 0;
let totalMoveCount = 0;
const env = {};
env.getNumStates = () => {
    return 16;
};
env.getMaxNumActions = () => {
    return 4;
};
let agent;

const spec = {
    update : 'qlearn', // qlearn | sarsa
    gamma : 0.9, // discount factor, [0, 1)
    epsilon : 0.9, // initial epsilon for epsilon-greedy policy, [0, 1)
    alpha : 0.9, // value function learning rate
    experience_add_every : 500, // number of time steps before we add another experience to replay memory
    experience_size : 10000, // size of experience replay memory
    learning_steps_per_iteration : 50
    //spec.tderror_clamp = 1.0; // for robustness
    //spec.num_hidden_units = 100 // number of neurons in hidden layer
};
initiateLearning = () => {

    agent = agent || new RL.DQNAgent(env, spec);

    return setInterval(function () { // start the learning loop
        if (gameManager.over === false) {
            totalMoveCount++;
            let state = serializeState();
            const action = agent.act(state); // s is an integer, action is integer

            const reward = simulateMove(action);
            plotMoveMetadata(reward);
            agent.learn(reward); // the agent improves its Q,policy,model, etc.
        } else {
            gameCount++;
            plotGameMetadata();
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
        },
            {
                type: "line",
                showInLegend: true,
                name: "average",
                dataPoints: averageRewards
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