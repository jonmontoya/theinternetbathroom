module.exports = class GraffitiCanvas {
  constructor(canvas, image) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    this.context.lineWidth = 1;

    this.drawStroke = this.drawStroke.bind(this);

    if (image) this.context.drawImage(image, 0, 0);
  }

  drawStroke(stroke) {
    const segment = stroke.stroke;
    this.context.strokeStyle = stroke.color;

    this.context.beginPath();
    this.context.moveTo(segment[0][0], segment[0][1]);
    this.context.lineTo(segment[1][0], segment[1][1]);
    this.context.stroke();
    this.context.closePath();
  }

  getImage() {
    return this.canvas.toDataURL();
  }
};
