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
          <meta name="apple-mobile-web-app-status-bar-style" content="black">
          <meta property="og:title" content="The Internet Bathroom"/>
          <meta property="og:url" content="http://theinternetbathroom.com"/>
          <meta property="og:image" content="${assetPath}theinternetbathroom.png"/>
          <link rel="icon" href="${assetPath}favicon.ico">
          <title>The Internet Bathroom</title>
          <script>
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-56715351-3', 'auto');
            ga('send', 'pageview');
          </script>
        </head>
        <body>
          <div id="app">
            <div id="info_modal"></div>
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
