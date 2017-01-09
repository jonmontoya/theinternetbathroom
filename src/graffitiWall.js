require('./styles/graffiti.scss');
const GraffitiCanvas = require('./utils/graffitiCanvas');

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

    this.ws = ws;

    this.el = el;
    this.el.classList.add('graffiti');
    this.el.style.width = `${width}px`;
    this.el.style.height = `${height}px`;

    // create graffiti elements
    this.graffitiCanvas = new GraffitiCanvas(document.createElement('canvas'), width, height);
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

    this.color = '#00FF00';
    this.prevPos = null;

    // bind draw events
    this.handleMove = this.handleMove.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleDown = this.handleDown.bind(this);

    this.setScale(scale);

    this.bindWS();
    addEventListener(this.el, ['mousedown', 'touchstart'], this.handleDown);
    addEventListener(this.el, ['mouseup', 'touchend'], this.handleUp);
  }

  refreshDisplayCanvas() {
    this.displayContext.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
    this.displayContext.drawImage(this.graffitiCanvas.canvas, 0, 0);
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
    this.ws.on('pixel', (data) => {
      this.graffitiCanvas.drawPixel(data);
      this.refreshDisplayCanvas();
    });

    this.ws.on('initData', (data) => {
      this.graffitiCanvas.putImageDataArray(data);
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

  handleMove(event) {
    const newPos = this.getPos(event);
    if (this.prevPos[0] === newPos[0] && this.prevPos[1] === newPos[1]) return;

    this.emitPixel(newPos);

    this.prevPos = newPos;
  }

  emitPixel(pos) {
    this.ws.emit('pixel', {
      color: this.color,
      pixel: pos,
    });
  }

  handleDown(event) {
    const pos = this.getPos(event);
    this.prevPos = pos;

    addEventListener(this.el, ['mousemove', 'touchmove'], this.handleMove);

    this.emitPixel(pos);
  }

  handleUp() {
    removeEventListener(this.el, ['mousemove', 'touchmove'], this.handleMove);

    this.prevPos = null;
  }
};
