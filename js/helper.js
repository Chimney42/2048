let couch;

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
        _couch = nano.use('trainingseconditeration');
    }
    couch = _couch;

    return {
        clone : clone,
        saveToCouch : saveToCouch
    };
};