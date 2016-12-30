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
  constructor(opts) {
    const { drawEl, graffitiEl, ws, width, height, scale } = opts;
    this.ws = ws;
    this.width = width;
    this.height = height;

    this.graffitiCanvas = new GraffitiCanvas(document.createElement('canvas'), width, height);

    this.displayCanvas = graffitiEl;
    this.displayContext = this.displayCanvas.getContext('2d');
    this.displayContext.imageSmoothingEnabled = false;

    this.drawEl = drawEl;
    this.color = '#00FF00';
    this.prevPos = null;

    this.handleMove = this.handleMove.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleDown = this.handleDown.bind(this);

    this.setScale(scale);

    this.bindWS();
    addEventListener(this.drawEl, ['mousedown', 'touchstart'], this.handleDown);
    addEventListener(this.drawEl, ['mouseup', 'touchend'], this.handleUp);
  }

  refreshDisplayCanvas() {
    this.displayContext.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
    this.displayContext.drawImage(this.graffitiCanvas.canvas, 0, 0);
  }

  setColor(color) {
    this.color = color;
  }

  setScale(scale) {
    const adjWidth = parseInt(this.width * scale, 10);
    const adjHeight = parseInt(this.height * scale, 10);

    this.scale = scale;

    this.displayCanvas.width = adjWidth;
    this.drawEl.style.width = `${adjWidth}px`;

    this.displayCanvas.height = adjHeight;
    this.drawEl.style.height = `${adjHeight}px`;

    this.displayContext.scale(scale, scale);
    this.refreshDisplayCanvas();
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

  scalePos([x, y]) {
    return [
      parseInt(x / this.scale, 10),
      parseInt(y / this.scale, 10),
    ];
  }

  getPos(event) {
    if (event.touches) {
      return this.scalePos([
        event.touches[0].clientX - event.touches[0].target.offsetLeft,
        event.touches[0].clientY - event.touches[0].target.offsetTop,
      ]);
    }

    return this.scalePos([event.offsetX, event.offsetY]);
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

  handleScroll() {
    event.preventDefault();
  }

  handleDown(event) {
    const pos = this.getPos(event);
    this.prevPos = pos;

    this.drawEl.addEventListener('scrollstart', this.handleScroll);
    addEventListener(this.drawEl, ['mousemove', 'touchmove'], this.handleMove);

    this.emitPixel(pos);
  }

  handleUp() {
    this.drawEl.removeEventListener('scrollstart', this.handleScroll);
    removeEventListener(this.drawEl, ['mousemove', 'touchmove'], this.handleMove);

    this.prevPos = null;
  }
};
