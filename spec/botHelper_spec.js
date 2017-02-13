const botHelper = require('../js/botHelper.js');

describe('A bothelper', () => {
    const serializedBoardstate = [0, 0, 4, 6, 2, 4, 0, 0];

    it('should generate a random direction', () => {
        expect(botHelper.getRandomDirection()).toBeGreaterThan(-1);
        expect(botHelper.getRandomDirection()).toBeLessThan(4);
    });

    it('should calculate a rating for the given boardstate', () => {

        const expRating = 4; // sum of values / number of tiles with values

        expect(botHelper.getRating(serializedBoardstate)).toBe(expRating);
    });

    it('should serialize to a one-dimensional boardState', () => {
        const boardstateCells = [
            [null, null, {value: 4}, {value: 6}],
            [{value: 2}, {value: 4}, null, null]
        ];
        expect(botHelper.serialize(boardstateCells)).toEqual(serializedBoardstate);
    });
});