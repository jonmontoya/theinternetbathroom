module.exports = function interpolateCoords([x1, y1], [x2, y2]) {
  const coords = [];
  const xRange = x2 - x1;
  const yRange = y2 - y1;
  const range = Math.max(Math.abs(xRange), Math.abs(yRange));

  const inc = 1 / range;

  let x;
  let y;
  let adj;

  for (let i = 0; i <= range; i += inc) {
    adj = (range - i) / range;
    x = x1 + (adj * xRange);
    y = y1 + (adj * yRange);

    const intX = parseInt(x, 10);
    const intY = parseInt(y, 10);

    if (coords.length) {
      const [lastX, lastY] = coords[coords.length - 1];
      if (intX !== lastX || intY !== lastY) coords.push([intX, intY]);
    } else {
      coords.push([intX, intY]);
    }
  }

  return coords;
};
