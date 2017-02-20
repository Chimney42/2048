let couch;

const serialize = gameGrid => {
    let boardState = [];
    gameGrid.forEach(row => {
        row.forEach(cell => {
            const c = cell ? cell.value : 0;
            boardState.push(c);
        })
    });
    return boardState;
};

const clone = twoDimensionArr => {
    let clonedArr = [];
    twoDimensionArr.forEach(row => {
        let clonedRow = [];
        row.forEach(val => {
            if(typeof val === 'object') {
                val = JSON.parse(JSON.stringify(val))
            }
            clonedRow.push(val);
        });
        clonedArr.push(clonedRow);
    });
    return clonedArr;
};

const calculateRating = boardState => {
    let count = 0;
    const sum = boardState.reduce((acc, cell) => {
        count += cell ? 1 : 0;
        return acc + cell;
    }, 0);

    return sum/count;
};

const saveToCouch = dataObj => {
    return new Promise((resolve, reject) => {
        couch.insert(dataObj, (err, body) => {
            if (err) reject(err);
            resolve(body);
        });
    });
};

module.exports = _couch => {
    if (!_couch) {
        const nano = require('nano')('http://localhost:5984');
        _couch = nano.use('training');
    }
    couch = _couch;

    return {
        serialize : serialize,
        clone : clone,
        calculateRating : calculateRating,
        saveToCouch : saveToCouch
    };
};