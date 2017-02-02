require('./styles/graffiti.scss');
const GraffitiCanvas = require('./utils/graffitiCanvas');
const interpolateCoords = require('./utils/interpolateCoords');

const hexToRgba = require('./utils/hexToRgba');
const {
  LAST_COLOR_USED_STORAGE_KEY: lastColorUsedStorageKey,
  pixelThrottle,
} = require('./utils/constants');

function addEventListener(el, events, handler) {
  if (events instanceof Array) {
    events.forEach(event => el.addEventListener(event, handler));
    return;
  }

  if (events instanceof String) {
    el.addEventListener(events, handler);
  }
}

function removeEventListener(el, events, handler) {
  if (events instanceof Array) {
    events.forEach(event => el.removeEventListener(event, handler));
    return;
  }

  if (events instanceof String) {
    el.removeEventListener(events, handler);
  }
}

module.exports = class GraffitiWall {
  constructor({ el, scale, foregroundUrl, width, height, ws }) {
    this.width = width;
    this.height = height;

    this.brushSize = 3;
    this.pixels = [];

    this.ws = ws;

    this.el = el;
    this.el.classList.add('graffiti');
    this.el.style.width = `${width}px`;
    this.el.style.height = `${height}px`;

    // create graffiti elements
    this.graffitiCanvas = new GraffitiCanvas(width, height);
    this.displayCanvas = document.createElement('canvas');
    this.foregroundEl = document.createElement('div');

    this.displayCanvas.width = this.width;
    this.displayCanvas.height = this.height;

    const visibleElements = [
      this.displayCanvas,
      this.foregroundEl,
    ];

    this.setupVisibleElements(visibleElements);

    // setup foreground background
    this.foregroundEl.style.backgroundImage = `url("${foregroundUrl}")`;
    this.foregroundEl.style.backgroundSize = 'cover';

    // setup display canvas
    this.displayContext = this.displayCanvas.getContext('2d');
    this.displayContext.imageSmoothingEnabled = false;

    this.color = window.localStorage.getItem(lastColorUsedStorageKey) || '#00ff00';
    this.prevPos = null;

    // bind draw events
    this.handleMove = this.handleMove.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleDown = this.handleDown.bind(this);
    this.sendPixels = this.sendPixels.bind(this);

    this.setScale(scale);

    this.bindWS();

    setInterval(this.sendPixels, 200);
  }

  setEditMode() {
    this.el.classList.add('editing');
    addEventListener(this.el, ['mousedown', 'touchstart'], this.handleDown);
    addEventListener(this.el, ['mouseup', 'touchend'], this.handleUp);
  }

  unsetEditMode() {
    this.el.classList.remove('editing');
    removeEventListener(this.el, ['mousedown', 'touchstart'], this.handleDown);
    removeEventListener(this.el, ['mouseup', 'touchend'], this.handleUp);
  }

  refreshDisplayCanvas() {
    this.displayContext.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
    const imageData = new ImageData(this.width, this.height);
    imageData.data.set(this.graffitiCanvas.imgArray);
    this.displayContext.putImageData(imageData, 0, 0);
  }

  setColor(color) {
    this.color = color;
  }

  setupVisibleElements(elements) {
    let topOffset = 0;
    elements.forEach((element) => {
      element.className = 'graffiti_visible';
      element.style.top = `${-topOffset}px`;
      this.el.appendChild(element);
      topOffset += this.height;
    });
  }

  setScale(scale) {
    this.scale = scale;
    this.calcScaleOffset();
  }

  calcScaleOffset() {
    const { offsetLeft, offsetTop } = this.el.parentNode;

    const scaledElWidth = this.width * this.scale;
    const scaledElHeight = this.height * this.scale;

    const deltaWidth = scaledElWidth - this.width;
    const deltaHeight = scaledElHeight - this.height;

    this.adjustOffsetLeft = offsetLeft - (deltaWidth / 2);
    this.adjustOffsetTop = offsetTop - (deltaHeight / 2);
  }

  bindWS() {
    this.ws.on('pixelData', (data) => {
      this.graffitiCanvas.drawPixels(data);
      this.refreshDisplayCanvas();
    });

    this.ws.on('initData', (data) => {
      this.graffitiCanvas.putImageDataArray(data);
      this.refreshDisplayCanvas();
    });

    this.ws.on('drawMeteor', (meteor) => {
      this.graffitiCanvas.drawPixels(meteor);
      this.refreshDisplayCanvas();
    });
  }


  getPos(event) {
    const e = event.touches ? event.touches[0] : event;
    const { clientX, clientY } = e;

    return [
      parseInt((clientX - this.adjustOffsetLeft) / this.scale, 10),
      parseInt((clientY - this.adjustOffsetTop) / this.scale, 10),
    ];
  }

  drawBrush([posX, posY]) {
    const { brushSize } = this;
    const adj = parseInt(brushSize / 2, 10);
    let dupIndex;

    for (let x = (posX - adj); x < posX + brushSize; x += 1) {
      for (let y = (posY - adj); y < posY + brushSize; y += 1) {
        dupIndex = this.pixels.findIndex(([findX, findY]) => x === findX && y === findY);
        if (dupIndex === -1) this.pixels.push([x, y, hexToRgba(this.color)]);
      }
    }
  }

  queuePixels(segment) {
    segment.forEach(pos => this.drawBrush(pos));
    this.displayContext.fillStyle = this.color;
    this.pixels.forEach(([x, y]) => this.displayContext.fillRect(x, y, 1, 1));
  }

  sendPixels() {
    if (!this.pixels.length) return;
    const pixels = this.pixels.splice(0, pixelThrottle);

    this.ws.emit('pixelData', pixels);
  }

  handleMove(event) {
    event.preventDefault();
    const newPos = this.getPos(event);
    const [newX, newY] = newPos;
    const [prevX, prevY] = this.prevPos;

    if (prevX === newX && prevY === newY) return;

    const segment = interpolateCoords(this.prevPos, newPos);
    this.queuePixels(segment);

    this.prevPos = newPos;
  }


  handleDown(event) {
    event.preventDefault();
    const pos = this.getPos(event);

    this.prevPos = pos;

    const segment = interpolateCoords(pos, pos);
    this.queuePixels(segment);

    addEventListener(this.el, ['mousemove', 'touchmove'], this.handleMove);
    addEventListener(this.el, ['mouseleave', 'touchleave'], this.handleUp);
  }

  handleUp(event) {
    if (event) event.preventDefault();

    removeEventListener(this.el, ['mousemove', 'touchmove'], this.handleMove);
    removeEventListener(this.el, ['mouseleave', 'touchleave'], this.handleUp);

    this.prevPos = null;
  }
};
