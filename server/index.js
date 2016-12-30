const { env, assetPath } = require('../config');

const PORT = 8081;

// serve app from webpack dev server
if (env === 'development') require('./devServer');

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: PORT,
});

server.register(require('./graffitiPlugin'), () => {
  // Add the route
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      return reply(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>The Internet Bathroom</title>
        </head>
        <body>
          <input id="color_input" class="jscolor" value="00ff00">
          <img id="app_background"></img>
          <div id="app">
            <canvas id="graffiti"></canvas>
            <div id="bathroom_foreground"></div>
            <canvas id="graffiti_draw"></canvas>
            <button id="color_picker">
          </div>
          <script src="${assetPath}bundle.js"></script>
        </body>
        </html>
      `);
    },
  });

  // Start the server
  server.start((err) => {
    if (err) {
      throw err;
    }
    console.log('Server running at:', server.info.uri);
  });
});
