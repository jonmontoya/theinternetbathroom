require('./styles/background.scss');
const galaxyImgUrl = require('./img/galaxy.jpg');

const appBackgroundEl = document.getElementById('app_background');

function loadImage(url) {
  const img = new Image();

  const loadPromise = new Promise((resolve) => {
    img.onload = () => resolve(img);
  });

  img.src = url;

  return loadPromise;
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

loadImage(galaxyImgUrl)
  .then((galaxyImg) => {
    appBackgroundEl.src = galaxyImgUrl;
    setBackgroundDimensions(galaxyImg, appBackgroundEl);

    window.addEventListener('resize', () => {
      setBackgroundDimensions(galaxyImg, appBackgroundEl);
    });
  });
