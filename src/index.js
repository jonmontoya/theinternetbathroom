require('./styles/app.scss');
require('./styles/background.scss');

const galaxyImgUrl = require('./img/galaxy.jpg');
const bathroomForegroundUrl = require('./img/bathroom_foreground.png');

const setBackgroundImage = require('./setBackgroundImage');

const GraffitiWall = require('./graffitiWall');
const ColorPicker = require('./colorPicker');

const io = require('socket.io-client');

const {
  IMAGE_WIDTH: wallWidth,
  IMAGE_HEIGHT: wallHeight,
} = require('./utils/constants');

const graffitiEl = document.getElementById('graffiti');
const colorPickerEl = document.getElementById('color_picker');
const displayApp = document.getElementById('app_scalable');
const backgroundImageEl = document.getElementById('app_background');

displayApp.style.width = `${wallWidth}px`;
displayApp.style.height = `${wallHeight}px`;

const socket = io();

// setup color picker
const colorPicker = new ColorPicker(colorPickerEl);

function getWallScale(imgWidth, imgHeight) {
  const { clientWidth, clientHeight } = document.documentElement;
  const clientAspectRatio = clientWidth / clientHeight;
  const aspectRatio = imgWidth / imgHeight;

  if (aspectRatio > clientAspectRatio) {
    return (clientWidth / imgWidth).toFixed(2);
  }

  return (clientHeight / imgHeight).toFixed(2);
}

if (!displayApp.requestFullScreen) {
  displayApp.requestFullScreen =
    displayApp.webkitRequestFullScreen ||
    displayApp.mozRequestFullScreen ||
    displayApp.msRequestFullScreen;
}

const scale = getWallScale(wallWidth, wallHeight);

setBackgroundImage(backgroundImageEl, galaxyImgUrl)
  .then(() => {
    const graffitiWall = new GraffitiWall({
      el: graffitiEl,
      scale,
      foregroundUrl: bathroomForegroundUrl,
      width: wallWidth,
      height: wallHeight,
      ws: socket,
    });

    colorPicker.on('color', color => graffitiWall.setColor(color));

    displayApp.style.transform = `scale(${scale})`;
    graffitiWall.setScale(scale);

    graffitiEl.style.top = `${-graffitiEl.offsetTop}px`;

    window.addEventListener('resize', () => {
      const resizeScale = getWallScale(wallWidth, wallHeight);
      graffitiWall.setScale(resizeScale);
      displayApp.style.transform = `scale(${resizeScale})`;
    });
  });
