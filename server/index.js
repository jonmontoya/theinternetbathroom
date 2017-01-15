const { env, assetPath } = require('../config');

const PORT = 8081;

// serve app from webpack dev server
if (env === 'development') require('./devServer');

const Hapi = require('hapi');

const server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: PORT,
});

server.register(require('./graffitiPlugin'), () => {
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      return reply(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="height=device-height, width=device-width, initial-scale=1, user-scalable=no">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="mobile-web-app-capable" content="yes">
          <title>The Internet Bathroom</title>
        </head>
        <body>
          <div id="app">
            <div id="toolbox"></div>
            <div id="app_scalable">
              <img id="app_background"></img>
              <div id="graffiti"></div>
            </div>
          </div>
          <script src="${assetPath}bundle.js"></script>
        </body>
        </html>
      `);
    },
  });

  server.start((err) => {
    if (err) {
      throw err;
    }
    console.info('Server running at:', server.info.uri);
  });
});
