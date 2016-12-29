/**
TODO: maintain versioned image data snapshot for performance
**/

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = 6379;
const GRAFFITI_REDIS_KEY = 'graffiti_image_data';

const { Validator } = require('jsonschema');
const schema = require('./schema.js');
const Canvas = require('canvas');
const redisAdapter = require('socket.io-redis');
const GraffitiCanvas = require('../src/utils/graffitiCanvas');
const redis = require('redis').createClient;

const {
  WALL_WIDTH: wallWidth,
  WALL_HEIGHT: wallHeight,
} = require('../src/utils/constants');

const validator = new Validator();

function getGraffitiData(client) {
  return new Promise((resolve, reject) => {
    client.get(GRAFFITI_REDIS_KEY, (err, reply) => {
      if (err) reject(err);

      resolve(reply);
    });
  });
}

function setGraffitiData(client, data) {
  client.set(GRAFFITI_REDIS_KEY, data);
}

exports.register = (server, options, next) => {
  const io = require('socket.io')(server.listener);
  console.info(`Socket Server Connected on ${server.info.uri}.`)

  const redisClient = redis(REDIS_PORT, REDIS_HOST);

  try {
    io.adapter(redisAdapter({ host: REDIS_HOST, port: REDIS_PORT }));
    console.info(`Socket Redis Adapter Connected to ${REDIS_HOST}:${REDIS_PORT}`);
  } catch (err) {
    console.error('Socket Server Connection Error: ', err);
    return;
  }

  let graffitiImageData = [];

  getGraffitiData(redisClient)
    .then((imgDataArray) => {
      let graffitiImageData = imgDataArray || '';

      const canvas = new Canvas();
      const graffitiCanvas = new GraffitiCanvas(canvas, wallWidth, wallHeight, graffitiImageData);

      io.on('connection', (socket) => {
        const socketAddress = socket.handshake.address;
        console.info(`Graffiti Socket Connection Established from ${socketAddress}.`);

        socket.emit('initData', graffitiImageData);

        socket.on('stroke', (data) => {
          const result = validator.validate(data, schema.strokeSchema);

          if (result.errors.length) return;

          graffitiCanvas.drawStroke(data);

          graffitiImageData = graffitiCanvas.getImageDataArray();
          setGraffitiData(redisClient, graffitiImageData);

          io.emit('stroke', data);
        });

        socket.on('close', () => {
          console.info(`Graffiti Socket Connection Disconnected from ${socketAddress}.`);
        });
      });

    });

  next();
};

exports.register.attributes = {
  name: 'graffitiServer',
  version: '1.0.0',
};
