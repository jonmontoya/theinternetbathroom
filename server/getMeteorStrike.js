const radiusMax = 50;
const logBase = 100;

// http://stackoverflow.com/questions/14611782/using-midpoint-circle-algorithm-to-generate-points-of-a-filled-circle
function distance(p1, p2) {
  let dx = p2.x - p1.x;
  dx *= dx;
  let dy = p2.y - p1.y;
  dy *= dy;
  return Math.sqrt(dx + dy);
}

function getCircle(x, y, r) {
  const ret = [];
  for (let j = x - r; j <= x + r; j += 1) {
    for (let k = y - r; k <= y + r; k += 1) {
      if (distance({ x: j, y: k }, { x, y }) <= r) ret.push([j, k, [0, 0, 0, 0]]);
    }
  }
  return ret;
}


module.exports = function getMeteorStrike(width, height) {
  const x = parseInt(width * Math.random(), 10);
  const y = parseInt(height * Math.random(), 10);

  const radiusAdj = Math.max(0, Math.log(Math.random() * logBase) / Math.log(logBase));

  if (!radiusAdj) return null;

  const radius = parseInt(radiusAdj * radiusMax, 10);

  return getCircle(x, y, radius);
};
