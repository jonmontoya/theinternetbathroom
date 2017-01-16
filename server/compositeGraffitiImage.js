const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');

const {
  IMAGE_WIDTH: wallWidth,
  IMAGE_HEIGHT: wallHeight,
} = require('../src/utils/constants');

const galaxyImgPath = '../src/img/galaxy.jpg';
const bathroomImgPath = '../src/img/bathroom_foreground.png';

function loadImage(pathName) {
  const image = new Canvas.Image();

  return new Promise((resolve) => {
    fs.readFile(path.join(__dirname, pathName), (err, imgSrc) => {
      if (err) throw err;
      image.src = imgSrc;
      resolve(image);
    });
  });
}

function getBackgroundScale(img) {
  const { width, height } = img;
  const clientWidth = wallWidth;
  const clientHeight = wallHeight;
  const clientDiag = parseInt(Math.sqrt(Math.pow(clientWidth, 2) + Math.pow(clientHeight, 2)), 10);

  let adjWidth;
  let adjHeight;
  let scale;

  if (height < width) {
    scale = clientDiag / height;
    adjHeight = clientDiag;
    adjWidth = scale * width;
  } else {
    scale = clientDiag / height;
    adjWidth = clientDiag;
    adjHeight = scale * height;
  }

  return {
    scale,
    left: (wallWidth - adjWidth) / 2,
    top: (wallHeight - adjHeight) / 2,
  };
}

function getImageScale(img) {
  const { width } = img;
  const clientWidth = wallWidth;

  return clientWidth / width;
}

module.exports = function compositeGraffitiImage(graffitiCanvas) {
  const snapshotCanvas = new Canvas();
  const snapshotContext = snapshotCanvas.getContext('2d');

  snapshotContext.globalCompositeOperation = 'source-over';

  snapshotCanvas.width = wallWidth;
  snapshotCanvas.height = wallHeight;

  return loadImage(galaxyImgPath)
    .then((galaxyImg) => {
      const { scale, left, top } = getBackgroundScale(galaxyImg);

      snapshotContext.scale(scale, scale);
      snapshotContext.drawImage(galaxyImg, left, top);

      snapshotContext.scale(1 / scale, 1 / scale);
      snapshotContext.drawImage(graffitiCanvas, 0, 0);
      return loadImage(bathroomImgPath);
    })
    .then((bathroomImg) => {
      const scale = getImageScale(bathroomImg);
      snapshotContext.scale(scale, scale);
      snapshotContext.drawImage(bathroomImg, 0, 0);
      return snapshotCanvas;
    });
};
