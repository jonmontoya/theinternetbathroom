const GraffitiCanvas = require('./utils/graffitiCanvas');

module.exports = class GraffitiWall {
  constructor(opts) {
    const { drawEl, graffitiEl, ws, width, height, scale } = opts;
    this.ws = ws;
    this.graffitiCanvas = new GraffitiCanvas(document.createElement('canvas'), width, height);

    this.displayCanvas = graffitiEl;
    this.displayContext = this.displayCanvas.getContext('2d');
    this.displayContext.imageSmoothingEnabled = false;
    this.displayContext.globalCompositeOperation = 'copy';

    this.drawEl = drawEl;
    this.color = '#00FF00';
    this.prevPos = null;

    this.handleMove = this.handleMove.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleDown = this.handleDown.bind(this);

    this.setSize(width, height, scale);

    this.bindWS();
    this.drawEl.addEventListener('mousedown', this.handleDown);
    this.drawEl.addEventListener('mouseup', this.handleUp);
  }

  refreshDisplayCanvas() {
    this.displayContext.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
    this.displayContext.drawImage(this.graffitiCanvas.canvas, 0, 0);
  }

  setSize(width, height, scale) {
    // TODO: preserve strokes on resize
    const adjWidth = parseInt(width * scale, 10);
    const adjHeight = parseInt(height * scale, 10);

    this.scale = scale;

    this.displayCanvas.width = adjWidth;
    this.drawEl.style.width = `${adjWidth}px`;

    this.displayCanvas.height = adjHeight;
    this.drawEl.style.height = `${adjHeight}px`;

    this.displayContext.scale(scale, scale);
    this.refreshDisplayCanvas();
  }

  bindWS() {
    this.ws.on('stroke', (stroke) => {
      this.graffitiCanvas.drawStroke(stroke);
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

  handleMove(event) {
    const newPos = this.scalePos([event.offsetX, event.offsetY]);

    if (this.prevPos[0] === newPos[0] && this.prevPos[1] === newPos[1]) return;

    this.ws.emit('stroke', {
      color: this.color,
      stroke: [
        this.prevPos,
        this.scalePos([event.offsetX, event.offsetY]),
      ],
    });

    this.prevPos = this.scalePos([event.offsetX, event.offsetY]);
  }

  handleScroll() {
    event.preventDefault();
  }

  handleDown(event) {
    this.prevPos = this.scalePos([event.offsetX, event.offsetY]);

    this.drawEl.addEventListener('scrollstart', this.handleScroll);
    this.drawEl.addEventListener('mousemove', this.handleMove);
  }

  handleUp() {
    this.drawEl.removeEventListener('scrollstart', this.handleScroll);
    this.drawEl.removeEventListener('mousemove', this.handleMove);

    this.prevPos = null;
  }
};
