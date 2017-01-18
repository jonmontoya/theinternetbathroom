const radiusMax = 50;
const logBase = 100;

module.exports = function getMeteorStrike(width, height) {
  const x = parseInt(width * Math.random(), 10);
  const y = parseInt(height * Math.random(), 10);

  const radiusAdj = Math.max(0, Math.log(Math.random() * logBase) / Math.log(logBase));

  if (!radiusAdj) return null;

  const radius = radiusAdj * radiusMax;

  return { x, y, radius };
};
