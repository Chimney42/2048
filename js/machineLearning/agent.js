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
        return acc + val;
    }, 0);

    return Math.floor(sum / arr.length);
};
const absoluteScores = [];
const averageScores = [];
let lastAvgScore = 0;
let scoreChart;
let moveChart;
const absoluteMoves = [];
const averageMoves = [];
let lastAvgMove = 0;

plotMetadata = () => {
    absoluteScores.push({
        x: gameCount,
        y: gameManager.score
    });

    if (absoluteScores.length > updateMetadataInterval) {
        absoluteScores.shift();
    }

    const scoreDiff = gameManager.score - lastAvgScore;
    lastAvgScore = lastAvgScore + (scoreDiff / gameCount);
    averageScores.push({
        x: gameCount,
        y: lastAvgScore
    });

    if(averageScores.length > updateMetadataInterval) {
        averageScores.shift();
    }

    scoreChart.render();

    absoluteMoves.push({
        x: gameCount,
        y: moveCount
    });

    if(absoluteMoves.length > updateMetadataInterval) {
        absoluteMoves.shift();
    }

    const moveDiff = moveCount - lastAvgMove;
    lastAvgMove = lastAvgMove + (moveDiff / gameCount);
    averageMoves.push({
        x: gameCount,
        y: lastAvgMove
    });

    if(averageMoves.length > updateMetadataInterval) {
        averageMoves.shift();
    }

    moveChart.render();
};

calculateRating = () => {
    const state = serializeState();
    const sum = state.reduce((acc, value) => acc + value, 0);
    const count = state.filter(val => val > 0).reduce((acc, value) => value ? acc + 1 : acc, 0);
    return sum / count;
};

simulateMove = (action) => {
    const lastRating = calculateRating();
    simulateKeyPress(action);
    let reward = calculateRating() - lastRating;
    if (gameManager.won) {
        reward = reward * reward;
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
let moveCount = 0;
let agent;
initiateLearning = () => {
    const env = {};
    env.getNumStates = () => {
        return 16;
    };
    env.getMaxNumActions = () => {
        return 4;
    };
    const spec = {};
    //spec.update = 'qlearn'; // qlearn | sarsa
    //spec.gamma = 0.9; // discount factor, [0, 1)
    spec.epsilon = 0.2; // initial epsilon for epsilon-greedy policy, [0, 1)
    spec.alpha = 0.01; // value function learning rate
    spec.experience_add_every = 10; // number of time steps before we add another experience to replay memory
    spec.experience_size = 50000; // size of experience replay memory
    spec.learning_steps_per_iteration = 50;
    //spec.tderror_clamp = 1.0; // for robustness
    //spec.num_hidden_units = 100 // number of neurons in hidden layer

    agent = new RL.DQNAgent(env, spec);

    return setInterval(function () { // start the learning loop
        if (gameManager.over === false) {
            moveCount++;
            let state = serializeState();
            const action = agent.act(state); // s is an integer, action is integer

            const reward = simulateMove(action);
            agent.learn(reward); // the agent improves its Q,policy,model, etc.
        } else {
            gameCount++;
            plotMetadata();
            moveCount = 0;
            gameManager.restart();
        }

    }, 0);
};

let db =  new PouchDB('http://localhost:5984/network');
let simulation;

$('#startSim').on('click', () => {
    scoreChart = new CanvasJS.Chart("scoreChart", {
        title: {
            text: "endscores per game"
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
            name: "average",
            dataPoints: averageScores
        }],
    });
    scoreChart.render();

    moveChart = new CanvasJS.Chart("moveChart", {
        title: {
            text: "moves per game"
        },
        data: [{
            type: "line",
            showInLegend: true,
            name: "absolute",
            dataPoints: absoluteMoves
        },
            {
                type: "line",
                showInLegend: true,
                name: "average",
                dataPoints: averageMoves
            }],
    });
    moveChart.render();




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
    document._id = 'thirdIteration';
    db.get(document._id).then(function(doc) {
        document._rev = doc._rev;
        return db.put(document);
    }).catch(function (err) {
        db.put(document);
    });
});

$('#loadAgent').on('click', () => {
    const document = db.get('thirdIteration');
    agent = agent.fromJSON(document);
});