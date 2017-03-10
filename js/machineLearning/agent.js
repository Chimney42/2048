simulateKeyPress = (key) => {
    const event = new KeyboardEvent('keydown', {key: key});
    document.dispatchEvent(event);
};

generateRandomKey = () => {
    return Math.floor(Math.random() * 4);
};


calculateAvg = (arr) => {
    if (arr.length === 0) {
        return 0;
    }

    const sum = arr.reduce((acc, val) => {
        return acc + val.y;
    }, 0);
    return sum / arr.length;
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
normalize = (val, max, min) => (val - min) / (max - min);

calculateReward = (action) => {
    const lastRating = calculateRating();
    simulateKeyPress(action);
    return calculateRating() - lastRating;
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
    return 16;
};
env.getMaxNumActions = () => {
    return 4;
};
let agent;

const spec = {
    update : 'qlearn', // qlearn | sarsa
    gamma : 0.9, // discount factor, [0, 1)
    epsilon : 0.15, // initial epsilon for epsilon-greedy policy, [0, 1)
    alpha : 0.1, // value function learning rate
    experience_add_every : 5, // number of time steps before we add another experience to replay memory
    experience_size : 50000, // size of experience replay memory
    learning_steps_per_iteration : 100,
    //spec.tderror_clamp = 1.0; // for robustness
    num_hidden_units : 256 // number of neurons in hidden layer
};

let gameCount = 1;
let moveCount = 1;

initiateLearning = () => {
    agent = agent || new RL.DQNAgent(env, spec);

    return setInterval(function () { // start the learning loop
        if (gameManager.over === false) {
            let state = serializeState();
            const action = agent.act(state); // s is an integer, action is integer
            simulateKeyPress(action);
            const reward = calculateReward(action);
            agent.learn(reward); // the agent improves its Q,policy,model, etc.
            logActionMeasurement(gameCount, reward, action);
            moveCount++;
        } else {
            logGameScoreMeasurement(gameCount, gameManager.score);
            moveCount = 1;
            gameCount++;
            gameManager.restart();
        }

    }, 0);
};

let db = new PouchDB('http://localhost:5984/network');
let simulation;

$('#startSim').on('click', () => {
    if (gameManager.over === false) {
        simulation = initiateLearning();
    } else {
        gameCount++;
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
    gameManager.restart();
    gameManager.storageManager.setBestScore(0);
   gameManager.actuate();
});