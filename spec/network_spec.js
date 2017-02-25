const botHelper = require('../js/network.js');

describe('A bothelper', () => {
    it('should generate a random direction', () => {
        const directions = [0,1,2,3];
        expect(botHelper.getRandomDirection(directions)).toBeGreaterThan(-1);
        expect(botHelper.getRandomDirection(directions)).toBeLessThan(4);
    });
});