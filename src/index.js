require('./styles/app.scss');
require('./styles/background.scss');

const screenfull = require('screenfull');

const galaxyImgUrl = require('./img/galaxy.jpg');
const bathroomForegroundUrl = require('./img/bathroom_foreground.png');

const setBackgroundImage = require('./setBackgroundImage');

const InfoModal = require('./infoModal');
const Toolbox = require('./toolbox');
const GraffitiWall = require('./graffitiWall');

const io = require('socket.io-client');

const {
  IMAGE_WIDTH: wallWidth,
  IMAGE_HEIGHT: wallHeight,
  LAST_VISIT_STORAGE_KEY: lastVisitStorageKey,
} = require('./utils/constants');

const infoModalEl = document.getElementById('info_modal');
const graffitiEl = document.getElementById('graffiti');
const toolboxEl = document.getElementById('toolbox');
const displayApp = document.getElementById('app_scalable');
const backgroundImageEl = document.getElementById('app_background');

displayApp.style.width = `${wallWidth}px`;
displayApp.style.height = `${wallHeight}px`;

const socket = io();

function getWallScale(imgWidth, imgHeight) {
  const { clientWidth, clientHeight } = document.documentElement;
  const clientAspectRatio = clientWidth / clientHeight;
  const aspectRatio = imgWidth / imgHeight;

  if (aspectRatio > clientAspectRatio) {
    return (clientWidth / imgWidth).toFixed(2);
  }

  return (clientHeight / imgHeight).toFixed(2);
}

const scale = getWallScale(wallWidth, wallHeight);

// show infomodal on first visit
const lastVisit = window.localStorage.getItem(lastVisitStorageKey);
const infoModal = new InfoModal(infoModalEl);

if (!lastVisit) {
  infoModal.showInstructions();
  window.localStorage.setItem(lastVisitStorageKey, new Date());
}

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

    const toolbox = new Toolbox({
      el: toolboxEl,
    });

    toolbox.on('color', color => graffitiWall.setColor(color));
    toolbox.on('editing', () => {
      graffitiWall.setEditMode();

      if (!screenfull.enabled) return;
      screenfull.request();
    });

    document.addEventListener('keydown', (event) => {
      if (!event.keyCode === 27) return;
      toolbox.unsetEditing();
      graffitiWall.unsetEditMode();
    });

    if (screenfull.enabled) {
      document.documentElement.addEventListener(screenfull.raw.fullscreenchange, () => {
        if (screenfull.isFullscreen) {
          infoModal.showEscTip();
          return;
        }

        toolbox.unsetEditing();
        graffitiWall.unsetEditMode();
      });
    }

    displayApp.style.transform = `scale(${scale})`;
    graffitiWall.setScale(scale);

    graffitiEl.style.top = `${-backgroundImageEl.height}px`;

    window.addEventListener('resize', () => {
      const resizeScale = getWallScale(wallWidth, wallHeight);
      graffitiWall.setScale(resizeScale);
      displayApp.style.transform = `scale(${resizeScale})`;
    });
  });
