require('./styles/app.scss');
require('./background');

const GraffitiWall = require('./graffitiWall');
const ColorPicker = require('./colorPicker');
const io = require('socket.io-client');
const {
  IMAGE_WIDTH: wallWidth,
  IMAGE_HEIGHT: wallHeight,
} = require('./utils/constants');

function getDimensions(imgWidth, imgHeight) {
  const { clientWidth, clientHeight } = document.documentElement;
  const clientAspectRatio = clientWidth / clientHeight;
  const aspectRatio = imgWidth / imgHeight;

  let scale;

  if (aspectRatio > clientAspectRatio) {
    scale = (clientHeight / imgHeight).toFixed(2);
  } else {
    scale = (clientWidth / imgWidth).toFixed(2);
  }

  const width = parseInt(imgWidth * scale, 10);
  const height = parseInt(imgHeight * scale, 10);
  const left = parseInt((clientWidth - width) / 2, 10);
  const top = parseInt((clientHeight - height) / 2, 10);

  return { scale, width, height, top, left };
}

const graffitiCanvas = document.getElementById('graffiti');
const graffitiDrawCanvas = document.getElementById('graffiti_draw');
const bathroomForegroundEl = document.getElementById('bathroom_foreground');

const socket = io();

const graffitiElements = [
  graffitiCanvas,
  graffitiDrawCanvas,
  bathroomForegroundEl,
];

const dimensions = getDimensions(wallWidth, wallWidth);

const graffitiWall = new GraffitiWall({
  graffitiEl: graffitiCanvas,
  drawEl: graffitiDrawCanvas,
  ws: socket,
  width: wallWidth,
  height: wallHeight,
  scale: 1,
});

// setup color picker
const colorPicker = new ColorPicker(document.getElementById('color_picker'));
colorPicker.on('color', color => graffitiWall.setColor(color));

function setElementDimensions(elements, { top, left, width, height }) {
  elements.forEach((el) => {
    if (el.nodeName !== 'CANVAS') {
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
    }

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  });
}

setElementDimensions(graffitiElements, dimensions);
graffitiWall.setScale(dimensions.scale);

window.addEventListener('resize', () => {
  const resizeDimensions = getDimensions(wallWidth, wallHeight);
  setElementDimensions(graffitiElements, resizeDimensions);
  graffitiWall.setScale(resizeDimensions.scale);
});
