const couch = jasmine.createSpyObj('couch', ['insert']);
const helper = require('../js/helper.js')(couch);

describe('A helper', () => {
    it('should serialize the game state', () => {
        const cells  = [[ null, { value: 2 }],
            [ null, null ]];
        const expState = [0, 2, 0, 0];

        expect(helper.serialize(cells)).toEqual(expState);
    });

    it('should deep clone a 2d array', () => {
        const obj = {'3': 4};
        const twoDimArr = [
            [1, 2],
            [obj, 5]
        ];
        const clonedArr = helper.clone(twoDimArr);

        expect(clonedArr).toEqual(twoDimArr);
        expect(clonedArr).not.toBe(twoDimArr);
        expect(clonedArr[1][0]).not.toBe(obj);
    });

    it('should calculate rating for a given boardstate', () => {
        const state = [0, 2, 4, 0];
        const expRating = 3;

        expect(helper.calculateRating(state)).toBe(expRating);
    });

    it('should save to couch and return a promise', () => {
        const doc = {1 : '2'};

        const promise = helper.saveToCouch(doc);

        expect(couch.insert).toHaveBeenCalledWith(doc, jasmine.any(Function));
        expect(promise).toEqual(jasmine.any(Promise));
    });
});