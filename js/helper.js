let nano;
let trainingCouch;
let networkCouch;

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
        trainingCouch.insert(dataObj, (err, body) => {
            if (err) reject(err);
            resolve(body);
        });
    });
};

const loadFromCouch = (dbName, docId) => {
    const db = nano.use(dbName);

    return new Promise((resolve, reject) => {
        db.get(docId, (err, body) => {
            if(err) reject(err);
            resolve(body);
        })
    });
};

module.exports = _couch => {
    if (!_couch) {
        nano = require('nano')('http://localhost:5984');
        _couch = nano.use('trainingseconditeration');
    }
    trainingCouch = _couch;

    return {
        clone : clone,
        saveToCouch : saveToCouch,
        loadFromCouch :  loadFromCouch
    };
};