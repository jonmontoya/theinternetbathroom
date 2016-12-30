const WebpackDevServer = require('webpack-dev-server');
const Webpack = require('webpack');
const webpackConfig = require('../webpack.dev.config.js');

webpackConfig.entry.app.unshift('webpack-dev-server/client?http://localhost:8080');
const compiler = Webpack(webpackConfig);
const webpackDevServer = new WebpackDevServer(compiler);
webpackDevServer.listen(8080);
