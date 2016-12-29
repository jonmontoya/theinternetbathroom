module.exports = class GraffitiCanvas {
  constructor(canvas, width, height, imgDataArray) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;

    this.canvas.width = width;
    this.canvas.height = height;

    this.context = canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
    this.context.lineWidth = 1;

    this.drawStroke = this.drawStroke.bind(this);

    if (imgDataArray && imgDataArray.length) this.putImageDataArray(imgDataArray);
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

  getImageDataArray() {
    const imgData = this.context.getImageData(0, 0, this.width, this.height);
    return imgData.data.toString();
  }

  putImageDataArray(imgDataArray) {
    const imageData = this.context.createImageData(this.width, this.height);
    imageData.data.set(imgDataArray.split(','));
    this.context.putImageData(imageData, 0, 0);
  }
};
