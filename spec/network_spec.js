const network = {'activate' : jasmine.createSpy('activate')};
const networkWrapper = require('../js/network.js')(network);

describe('A bothelper', () => {
    it('should generate a random direction', () => {
        const directions = [0,1,2,3];
        expect(networkWrapper.getRandomDirection(directions)).toBeGreaterThan(-1);
        expect(networkWrapper.getRandomDirection(directions)).toBeLessThan(4);
    });

    it('should generate a direction from trained network', () => {
        const boardState = [2, 8, 4, 0];
        const moveNo = 5;
        const dataPoint = {
            boardState : boardState,
            moveNo : moveNo
        };
        const activation = [moveNo].concat(boardState);
        const allowedDirections = [0, 2, 3];
        network.activate.and.returnValue([0, 0, 1, 0]);


        expect(networkWrapper.getTrainedDirection(dataPoint, allowedDirections)).toBe(2);
        expect(network.activate).toHaveBeenCalledWith(activation);
    });
});