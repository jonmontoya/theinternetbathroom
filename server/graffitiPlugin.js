const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = 6379;
const GRAFFITI_REDIS_KEY = 'graffiti_image_data';
const LAST_METEOR_STRIKE_REDIS_KEY = 'last_meteor_strike';

const { Validator } = require('jsonschema');
const schema = require('./schema.js');
const Canvas = require('canvas');
const GraffitiCanvas = require('../src/utils/graffitiCanvas');
const redisAdapter = require('socket.io-redis');
const redis = require('redis').createClient;
const compositeGraffitiImage = require('./compositeGraffitiImage');
const updateMetaImage = require('./updateMetaImage');
const getMeteorStrike = require('./getMeteorStrike');

const { env } = require('../config');

// create meteor strike every 6 hours
const meteorStrikeFrequency = 21600000;

// update meta image every minute on new strokes
const metaImageUpdateFrequency = 60000;
let updatedMetaImageDate = new Date();

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

function setGraffitiData(client, data) {
  return new Promise((resolve) => {
    client.set(GRAFFITI_REDIS_KEY, data, () => {
      resolve();
    });
  });
}

function getLastMeteorStrike(client) {
  return new Promise((resolve, reject) => {
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

        const meteor = getMeteorStrike(wallWidth, wallHeight);

        if (!meteor) return;

        graffitiCanvas.drawMeteor(meteor);
        graffitiImageData = graffitiCanvas.getImageDataArray();
        setGraffitiData(redisClient, graffitiImageData);
        io.emit('drawMeteor', meteor);
      }, 60000);

      subscribe.on('message', (channel, data) => {
        if (channel !== 'stroke') return;
        const stroke = JSON.parse(data);
        io.emit('stroke', stroke);

        getGraffitiData(redisClient)
          .then((imgDataArray) => {
            graffitiImageData = imgDataArray || '';
          });
      });

      subscribe.subscribe('stroke');

      io.on('connection', (socket) => {
        const socketAddress = socket.handshake.address;
        console.info(`Graffiti Socket Connection Established from ${socketAddress}.`);

        socket.emit('initData', graffitiImageData);

        socket.on('stroke', (data) => {
          const result = validator.validate(data, schema.strokeSchema);

          if (result.errors.length) return;

          graffitiCanvas.drawStroke(data);
          graffitiImageData = graffitiCanvas.getImageDataArray();
          setGraffitiData(redisClient, graffitiImageData)
            .then(() => publish.publish('stroke', JSON.stringify(data)));

          const date = new Date();
          if (env === 'production' && date.getTime() - updatedMetaImageDate > metaImageUpdateFrequency) {
            updatedMetaImageDate = date;
            compositeGraffitiImage(graffitiCanvas.canvas)
              .then(updateMetaImage);
          }
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
