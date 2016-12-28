const GraffitiCanvas = require('./utils/graffitiCanvas.js');

module.exports = class GraffitiWall {
  constructor(opts) {
    const { graffitiEl, ws, imgUrl, width, height, scale } = opts;
    this.ws = ws;
    this.graffitiCanvas = new GraffitiCanvas(graffitiEl);
    this.color = '#00FF00';
    this.prevPos = null;

    this.handleMove = this.handleMove.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleDown = this.handleDown.bind(this);

    this.setSize(width, height, scale);
    if (imgUrl) this.primeCanvas(imgUrl);
    this.bindWS();
    this.graffitiCanvas.canvas.addEventListener('mousedown', this.handleDown);
    this.graffitiCanvas.canvas.addEventListener('mouseup', this.handleUp);
  }

  setSize(width, height, scale) {
    // TODO: Redraw canvas on resize
    const adjWidth = parseInt(width * scale, 10);
    const adjHeight = parseInt(height * scale, 10);

    this.scale = scale;

    this.graffitiCanvas.canvas.width = adjWidth;
    this.graffitiCanvas.canvas.height = adjHeight;
    this.graffitiCanvas.context.scale(scale, scale);
  }

  primeCanvas(imgUrl) {
    const img = new Image();
    img.onload = () => this.graffitiCanvas.context.drawImage(img, 0, 0);
    img.src = imgUrl;
  }

  bindWS() {
    this.ws.on('stroke', this.graffitiCanvas.drawStroke);
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

    this.graffitiCanvas.canvas.addEventListener('scrollstart', this.handleScroll);

    // this.graffitiCanvas.context.beginPath();
    // this.graffitiCanvas.context.moveTo(event.offsetX, event.offsetY);

    this.graffitiCanvas.canvas.addEventListener('mousemove', this.handleMove);
  }

  handleUp() {
    this.graffitiCanvas.canvas.removeEventListener('scrollstart', this.handleScroll);
    this.graffitiCanvas.canvas.removeEventListener('mousemove', this.handleMove);

    this.prevPos = null;
  }
};
