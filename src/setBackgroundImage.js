const {
  IMAGE_WIDTH: wallWidth,
  IMAGE_HEIGHT: wallHeight,
} = require('./utils/constants');

function setBackgroundDimensions(imgEl) {
  const { width, height } = imgEl;
  const clientWidth = wallWidth;
  const clientHeight = wallHeight;
  const clientDiag = parseInt(Math.sqrt((clientWidth ** 2) + (clientHeight ** 2)), 10);

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

  imgEl.style.width = `${adjWidth}px`;
  imgEl.style.height = `${adjHeight}px`;
  imgEl.style.left = `${(wallWidth - adjWidth) / 2}px`;
  imgEl.style.top = `${(wallHeight - adjHeight) / 2}px`;
}

module.exports = function setBackgroundImage(imgEl, imgUrl) {
  return new Promise((resolve) => {
    imgEl.onload = () => {
      setBackgroundDimensions(imgEl);
      resolve();
    };

    imgEl.src = imgUrl;
  });
};
