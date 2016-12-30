const env = process.env.NODE_ENV || 'development';
const assetPath = env === 'production' ? 'http://theinternetbathroom-assets.s3.amazonaws.com/' : 'http://localhost:8080/';

module.exports = { env, assetPath };
