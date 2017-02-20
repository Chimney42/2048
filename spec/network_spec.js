const botHelper = require('../js/network.js');

describe('A bothelper', () => {
    it('should generate a random direction', () => {
        expect(botHelper.getRandomDirection()).toBeGreaterThan(-1);
        expect(botHelper.getRandomDirection()).toBeLessThan(4);
    });
});