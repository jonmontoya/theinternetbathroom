const PORT = 8081;
const ENV = process.env.NODE_ENV || 'development';

// serve app from webpack dev server
if (ENV === 'development') require('./devServer');

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: PORT,
});

server.register([require('inert'), require('./graffitiPlugin')], () => {
  server.route({
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: 'assets',
      },
    },
  });

  // Add the route
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      const assets = ENV === 'development' ? 'http://localhost:8080/bundle.js' : 'asssets/bundle.js';
      return reply(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>The Internet Bathroom</title>
        </head>
        <body>
          <img id="app_background"></img>
          <div id="app">
            <div id="app_canvas_wrapper">
              <canvas id="graffiti"></canvas>
              <canvas id="app_canvas"></canvas>
            </div>
          </div>
          <script src="${assets}"></script>
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
