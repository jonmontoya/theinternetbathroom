module.exports = class GraffitiCanvas {
  constructor(canvas, width, height, imgDataArray) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;

    this.canvas.width = width;
    this.canvas.height = height;

    this.context = canvas.getContext('2d');

    this.drawPixel = this.drawPixel.bind(this);

    if (imgDataArray && imgDataArray.length) this.putImageDataArray(imgDataArray);
  }

  drawPixel(data) {
    const { pixel, color } = data;
    const [x, y] = pixel;

    this.context.fillStyle = color;
    this.context.fillRect(x, y, 3, 3);
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
