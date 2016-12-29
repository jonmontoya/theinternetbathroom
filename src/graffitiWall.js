const GraffitiCanvas = require('./utils/graffitiCanvas');

module.exports = class GraffitiWall {
  constructor(opts) {
    const { drawEl, graffitiEl, ws, width, height, scale } = opts;
    this.ws = ws;
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

    this.setSize(width, height, scale);

    this.bindWS();
    this.drawEl.addEventListener('mousedown', this.handleDown);
    this.drawEl.addEventListener('mouseup', this.handleUp);
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
    this.displayContext.drawImage(this.graffitiCanvas.canvas, 0, 0);
  }

  bindWS() {
    this.ws.on('stroke', (stroke) => {
      this.graffitiCanvas.drawStroke(stroke);
      this.displayContext.drawImage(this.graffitiCanvas.canvas, 0, 0);
    });

    this.ws.on('initData', (data) => {
      this.graffitiCanvas.putImageDataArray(data);
      this.displayContext.drawImage(this.graffitiCanvas.canvas, 0, 0);
    });
  }

  scalePos([x, y]) {
    return [
      x / this.scale,
      y / this.scale,
    ];
  }

  handleMove(event) {
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

    // this.displayCanvas.context.beginPath();
    // this.displayCanvas.context.moveTo(event.offsetX, event.offsetY);

    this.drawEl.addEventListener('mousemove', this.handleMove);
  }

  handleUp() {
    this.drawEl.removeEventListener('scrollstart', this.handleScroll);
    this.drawEl.removeEventListener('mousemove', this.handleMove);

    this.prevPos = null;
  }
};
