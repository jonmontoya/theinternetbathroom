require('./styles/app.scss');
require('./jscolor');

const galaxyImgUrl = require('./img/galaxy.jpg');
const GraffitiWall = require('./graffitiWall');
const io = require('socket.io-client');
const {
  IMAGE_WIDTH: wallWidth,
  IMAGE_HEIGHT: wallHeight,
} = require('./utils/constants');

function loadImage(url) {
  const img = new Image();

  const loadPromise = new Promise((resolve) => {
    img.onload = () => resolve(img);
  });

  img.src = url;

  return loadPromise;
}

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

function setBackgroundDimensions(img, backgroundEl) {
  const { width, height } = img;
  const { clientWidth, clientHeight } = document.documentElement;
  const clientDiag = parseInt(Math.sqrt((clientWidth ** 2) + (clientHeight ** 2)), 10);

  let adjWidth;
  let adjHeight;
  let scale;

  if (height < width) {
    scale = (clientDiag / height).toFixed(2);
    adjHeight = clientDiag;
    adjWidth = parseInt(scale * width, 10);
  } else {
    scale = (clientDiag / height).toFixed(2);
    adjWidth = clientDiag;
    adjHeight = parseInt(scale * height, 10);
  }

  const left = parseInt((clientWidth - adjWidth) / 2, 10);
  const top = parseInt((clientHeight - adjHeight) / 2, 10);

  backgroundEl.style.top = `${top}px`;
  backgroundEl.style.left = `${left}px`;
  backgroundEl.style.width = `${adjWidth}px`;
  backgroundEl.style.height = `${adjHeight}px`;
}

const appBackgroundEl = document.getElementById('app_background');
const graffitiCanvas = document.getElementById('graffiti');
const graffitiDrawCanvas = document.getElementById('graffiti_draw');
const bathroomForegroundEl = document.getElementById('bathroom_foreground');

const colorPickerButton = document.getElementById('color_picker');
const colorPickerInput = document.getElementById('color_input');

const socket = io();

loadImage(galaxyImgUrl)
  .then((galaxyImg) => {
    appBackgroundEl.src = galaxyImgUrl;
    setBackgroundDimensions(galaxyImg, appBackgroundEl);

    window.addEventListener('resize', () => {
      setBackgroundDimensions(galaxyImg, appBackgroundEl);
    });
  });

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

// Setup Color Picker
colorPickerButton.onclick = () => {
  colorPickerInput.jscolor.show();
};

colorPickerInput.onchange = () => {
  const color = `#${colorPickerInput.jscolor.toString()}`;
  graffitiWall.setColor(color);
  colorPickerButton.style.backgroundColor = color;
};

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
