require('./styles/app.scss');
require('./background');
const bathroomForegroundUrl = require('./img/bathroom_foreground.png');

const GraffitiWall = require('./graffitiWall');
const ColorPicker = require('./colorPicker');
const io = require('socket.io-client');

const {
  IMAGE_WIDTH: wallWidth,
  IMAGE_HEIGHT: wallHeight,
} = require('./utils/constants');

const graffitiEl = document.getElementById('graffiti');
const colorPickerEl = document.getElementById('color_picker');
const socket = io();

function getWallScale(imgWidth, imgHeight) {
  const { clientWidth, clientHeight } = document.documentElement;
  const clientAspectRatio = clientWidth / clientHeight;
  const aspectRatio = imgWidth / imgHeight;

  if (aspectRatio > clientAspectRatio) {
    return (clientHeight / imgHeight).toFixed(2);
  }

  return (clientWidth / imgWidth).toFixed(2);
}

const graffitiWall = new GraffitiWall({
  el: graffitiEl,
  scale: getWallScale(wallWidth, wallHeight),
  foregroundUrl: bathroomForegroundUrl,
  width: wallWidth,
  height: wallHeight,
  ws: socket,
});

window.addEventListener('resize', () => {
  graffitiWall.setScale(getWallScale(wallWidth, wallHeight));
});


// setup color picker
const colorPicker = new ColorPicker(colorPickerEl);
colorPicker.on('color', color => graffitiWall.setColor(color));
