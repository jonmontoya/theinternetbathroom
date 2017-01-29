const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = 6379;
const GRAFFITI_REDIS_KEY = 'graffiti_image_data';
const GRAFFITI_QUEUE_REDIS_KEY = 'graffiti_queue';

const redis = require('redis').createClient;

const { env } = require('../config');

const {
  IMAGE_WIDTH: wallWidth,
  IMAGE_HEIGHT: wallHeight,
} = require('../src/utils/constants');

const Canvas = require('canvas');
const GraffitiCanvas = require('../src/utils/graffitiCanvas');
const compositeGraffitiImage = require('./compositeGraffitiImage');
const updateMetaImage = require('./updateMetaImage');

// update meta image every minute on new strokes
const metaImageUpdateFrequency = 60000;
let updatedMetaImageDate = new Date();

function getGraffitiData(client) {
  return new Promise((resolve, reject) => {
    client.get(GRAFFITI_REDIS_KEY, (err, reply) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(reply);
    });
  });
}

function setGraffitiData(client, data) {
  return new Promise((resolve, reject) => {
    client.set(GRAFFITI_REDIS_KEY, data, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

module.exports = class GraffitiWorker {
  constructor() {
    const redisClient = redis(REDIS_PORT, REDIS_HOST);
    const subscribe = redis(REDIS_PORT, REDIS_HOST);

    getGraffitiData(redisClient)
      .then((imgDataArray) => {
        const graffitiImageData = imgDataArray || '';
        const canvas = new Canvas();
        canvas.width = wallWidth;
        canvas.height = wallHeight;
        const context = canvas.getContext('2d');
        const graffitiCanvas = new GraffitiCanvas(wallWidth, wallHeight, graffitiImageData);

        subscribe.on('message', () => {
          redisClient.lpop(GRAFFITI_QUEUE_REDIS_KEY, (err, queueData) => {
            if (err) {
              console.error('Graffiti Worker Redis Queue LPOP Error:', err);
              return;
            }

            if (!queueData) return;

            const json = JSON.parse(queueData);
            const { type, data } = json;

            if (type === 'pixelData') {
              graffitiCanvas.drawPixels(data);
            } else if (type === 'meteor') {
              graffitiCanvas.drawPixels(data);
            }

            setGraffitiData(redisClient, graffitiCanvas.getImageDataArray());

            const date = new Date();
            if (env === 'production' && date.getTime() - updatedMetaImageDate > metaImageUpdateFrequency) {
              updatedMetaImageDate = date;
              const imageData = context.createImageData(canvas.width, canvas.height);
              imageData.data.set(graffitiCanvas.imgArray);
              context.putImageData(imageData, 0, 0);

              compositeGraffitiImage(canvas)
                .then(updateMetaImage);
            }
          });
        });

        subscribe.subscribe('canvasQueueEvent');
      });
  }
};
