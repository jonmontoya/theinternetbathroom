const env = process.env.NODE_ENV || 'development';
const assetPath = env === 'development' ? 'http://localhost:8080/assets/' : 'http://theinternetbathroom-assets.s3.amazonaws.com/';

module.exports = { env, assetPath };
