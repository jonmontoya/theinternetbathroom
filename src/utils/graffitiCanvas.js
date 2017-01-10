module.exports = class GraffitiCanvas {
  constructor(canvas, width, height, imgDataArray) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;

    this.canvas.width = width;
    this.canvas.height = height;

    this.context = canvas.getContext('2d');

    this.context.lineWidth = 3;

    this.drawStroke = this.drawStroke.bind(this);

    if (imgDataArray && imgDataArray.length) this.putImageDataArray(imgDataArray);
  }

  drawStroke(data) {
    const { context } = this;
    context.strokeStyle = data.color;

    context.beginPath();
    data.stroke.forEach(([strokeX, strokeY]) => {
      context.lineTo(strokeX, strokeY);
      context.stroke();
      context.moveTo(strokeX, strokeY);
    });

    context.closePath();
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
