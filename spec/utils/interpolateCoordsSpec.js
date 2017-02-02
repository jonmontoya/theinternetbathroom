const interpolateCoords = require('../../src/utils/interpolateCoords');

describe('interpolateCoords', () => {
  it('returns an array of interpolated coordinates', () => {
    expect(interpolateCoords([3, 3], [0, 0]))
      .toEqual([[0, 0], [1, 1], [2, 2], [3, 3]]);
  });
});
