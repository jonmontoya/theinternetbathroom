require('./styles/app.scss');

const galaxyImgUrl = require('./img/galaxy.jpg');
const GraffitiWall = require('./graffitiWall');
const io = require('socket.io-client');
const {
  IMAGE_WIDTH: width,
  IMAGE_HEIGHT: height,
  WALL_WIDTH: wallWidth,
  WALL_HEIGHT: wallHeight,
  WALL_X_OFFSET: offsetX,
  WALL_Y_OFFSET: offsetY,
} = require('./utils/constants');

function loadImage(url) {
  const img = new Image();

  const loadPromise = new Promise((resolve) => {
    img.onload = () => resolve(img);
  });

  img.src = url;

  return loadPromise;
}

function setWrapperDimensions(el, width, height, scale) {
  el.style.width = `${parseInt(width * scale, 10)}px`;
  el.style.height = `${parseInt(height * scale, 10)}px`;
}

function setGraffitiOffset(el, wrapperEl, offsetX, offsetY, scale) {
  const offsetTop = wrapperEl.offsetTop + offsetY * scale;
  const offsetLeft = wrapperEl.offsetLeft + offsetX * scale;

  el.style.top = `${offsetTop}px`;
  el.style.left = `${offsetLeft}px`;
}

function getScale(width, height) {
  const { clientWidth, clientHeight } = document.documentElement;
  const clientAspectRatio = clientWidth / clientHeight;
  const aspectRatio = width / height;

  let scale;

  if (aspectRatio > clientAspectRatio) {
    scale = (clientWidth / width).toFixed(2);
  } else {
    scale = (clientHeight / height).toFixed(2);
  }

  return scale;
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

const appCanvasWrapper = document.getElementById('app_canvas_wrapper');
const appBackgroundEl = document.getElementById('app_background');
const graffitiCanvas = document.getElementById('graffiti');
const graffitiDrawCanvas = document.getElementById('graffiti_draw');
const socket = io();

loadImage(galaxyImgUrl)
  .then((galaxyImg) => {
    appBackgroundEl.src = galaxyImgUrl;
    setBackgroundDimensions(galaxyImg, appBackgroundEl);

    window.addEventListener('resize', () => {
      setBackgroundDimensions(galaxyImg, appBackgroundEl);
    });
  });

  const scale = getScale(width, height);

  const graffitiWall = new GraffitiWall({
    graffitiEl: graffitiCanvas,
    drawEl: graffitiDrawCanvas,
    ws: socket,
    width: wallWidth,
    height: wallHeight,
    scale,
  });

  function setElementDimensions(elScale) {
    setWrapperDimensions(appCanvasWrapper, width, height, elScale);
    setGraffitiOffset(graffitiCanvas, appCanvasWrapper, offsetX, offsetY, elScale);
    setGraffitiOffset(graffitiDrawCanvas, appCanvasWrapper, offsetX, offsetY, elScale);
    graffitiWall.setSize(wallWidth, wallHeight, elScale);
  }

  setElementDimensions(scale);

  window.addEventListener('resize', () => {
    const resizeScale = getScale(width, height);
    setElementDimensions(resizeScale);
  });
