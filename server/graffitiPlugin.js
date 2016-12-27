const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = 6379;

const {EventEmitter} = require('events');
const {Validator} = require('jsonschema');
const schema = require('./schema.js');
const Canvas = require('canvas');
const redis = require('socket.io-redis');
const GraffitiCanvas = require('../src/utils/graffitiCanvas');

const validator = new Validator();
const graffitiBus = new EventEmitter();

const graffitiCanvas = new GraffitiCanvas(new Canvas());

exports.register = (server, options, next) => {
  const io = require('socket.io')(server.listener);
  console.info(`Socket Server Connected on ${server.info.uri}.`)

  try {
    io.adapter(redis({ host: REDIS_HOST, port: REDIS_PORT }));
    console.info(`Socket Redis Adapter Connected to ${REDIS_HOST}:${REDIS_PORT}`);
  } catch(err) {
    console.error('Socket Server Connection Error: ', err);
    return;
  }

  io.on('connection', (socket) => {
    const socketAddress = socket.handshake.address;
    console.info(`Graffiti Socket Connection Established from ${socketAddress}.`);

    function handleStroke(data) {
      socket.emit('stroke', data);
    }

    graffitiBus.on('stroke', handleStroke);

    socket.on('stroke', (data) => {
      const result = validator.validate(data, schema.strokeSchema);
      console.log(data);
      if (result.errors.length) return;

      graffitiCanvas.drawStroke(data);
      // createPNGSnapshot(graffitiCanvas.canvas);
      graffitiBus.emit('stroke', data);
    });

    socket.on('close', () => {
      console.info(`Graffiti Socket Connection Disconnected from ${socketAddress}.`);
      graffitiBus.removeListener('stroke', handleStroke);
    });
  });

  next();
};

exports.register.attributes = {
  name: 'graffitiServer',
  version: '1.0.0',
};
