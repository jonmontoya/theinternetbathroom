const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = 6379;
const GRAFFITI_REDIS_KEY = 'graffiti_image_data';
const GRAFFITI_QUEUE_REDIS_KEY = 'graffiti_queue';
const LAST_METEOR_STRIKE_REDIS_KEY = 'last_meteor_strike';

const { Validator } = require('jsonschema');
const schema = require('./schema.js');
const Canvas = require('canvas');
const GraffitiCanvas = require('../src/utils/graffitiCanvas');
const redisAdapter = require('socket.io-redis');
const redis = require('redis').createClient;
const getMeteorStrike = require('./getMeteorStrike');

// create meteor strike every 6 hours
const meteorStrikeFrequency = 21600000;

const {
  IMAGE_WIDTH: wallWidth,
  IMAGE_HEIGHT: wallHeight,
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

function getLastMeteorStrike(client) {
  return new Promise((resolve) => {
    client.get(LAST_METEOR_STRIKE_REDIS_KEY, (err, reply) => {
      if (err) reply(new Date());
      const lastMeteorStrike = reply ? new Date(reply) : new Date();
      resolve(lastMeteorStrike);
    });
  });
}

function setLastMeteorStrike(client, data) {
  client.set(LAST_METEOR_STRIKE_REDIS_KEY, data);
}

exports.register = (server, options, next) => {
  console.info(`Socket Server Connected on ${server.info.uri}.`)

  const redisClient = redis(REDIS_PORT, REDIS_HOST);
  const subscribe = redis(REDIS_PORT, REDIS_HOST);
  const publish = redis(REDIS_PORT, REDIS_HOST);

  let io;
  let graffitiImageData;

  try {
    io = require('socket.io')(server.listener);
    io.adapter(redisAdapter({ host: REDIS_HOST, port: REDIS_PORT }));
    console.info(`Socket Redis Adapter Connected to ${REDIS_HOST}:${REDIS_PORT}`);
  } catch (err) {
    console.error('Socket Server Connection Error: ', err);
    return;
  }

  getGraffitiData(redisClient)
    .then((imgDataArray) => {
      graffitiImageData = imgDataArray || '';
      return getLastMeteorStrike(redisClient);
    })
    .then((lastMeteorStrike) => {
      const canvas = new Canvas();
      const graffitiCanvas = new GraffitiCanvas(canvas, wallWidth, wallHeight, graffitiImageData);
      let nextMeteorStrike = new Date(lastMeteorStrike.getTime() + meteorStrikeFrequency);

      setInterval(() => {
        const date = new Date();

        if (date.getTime() < nextMeteorStrike.getTime()) return;

        nextMeteorStrike = Date(nextMeteorStrike.getTime() + meteorStrikeFrequency);
        setLastMeteorStrike(redisClient, date);

        const data = getMeteorStrike(wallWidth, wallHeight);

        if (!data) return;

        const canvasEvent = JSON.stringify({ type: 'meteor', data });
        publish.publish('canvasEvent', canvasEvent);

        redisClient.rpush(GRAFFITI_QUEUE_REDIS_KEY, canvasEvent, () => {
          publish.publish('canvasQueueEvent', true);
        });
      }, 60000);

      subscribe.on('message', (channel, message) => {
        const json = JSON.parse(message);
        const { type, data } = json;
        if (type === 'stroke') {
          graffitiCanvas.drawStroke(data);
          io.emit('stroke', data);
        } else if (type === 'meteor') {
          graffitiCanvas.drawMeteor(data);
          io.emit('drawMeteor', data);
        }
      });

      subscribe.subscribe('canvasEvent');

      io.on('connection', (socket) => {
        const socketAddress = socket.handshake.address;
        console.info(`Graffiti Socket Connection Established from ${socketAddress}.`);

        socket.emit('initData', graffitiCanvas.getImageDataArray());

        socket.on('stroke', (data) => {
          const result = validator.validate(data, schema.strokeSchema);

          if (result.errors.length) return;

          const canvasEvent = JSON.stringify({ type: 'stroke', data });

          publish.publish('canvasEvent', canvasEvent);

          redisClient.rpush(GRAFFITI_QUEUE_REDIS_KEY, canvasEvent, () => {
            publish.publish('canvasQueueEvent', true);
          });
        });

        socket.on('close', () => {
          console.info(`Graffiti Socket Connection Disconnected from ${socketAddress}.`);
        });
      });
    })
    .catch(err => console.error(err));

  next();
};

exports.register.attributes = {
  name: 'graffitiServer',
  version: '1.0.0',
};
