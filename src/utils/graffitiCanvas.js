// http://jsperf.com/canvas-pixel-manipulation
const imgArrayStructSize = 4;

module.exports = class GraffitiCanvas {
  constructor(width, height, imgDataArray) {
    this.width = width;
    this.height = height;

    const arrayElements = width * height;

    this.imgArray = new Uint32Array(arrayElements * imgArrayStructSize);
    this.drawPixels = this.drawPixels.bind(this);

    if (imgDataArray && imgDataArray.length) this.putImageDataArray(imgDataArray);
  }

  putPixel(x, y, rGBA) {
    if (x >= this.width || x < 0 || y >= this.height || y < 0) return;
    const pos = (x * imgArrayStructSize) + (y * this.width * imgArrayStructSize);
    if (pos >= this.imgArray.length || pos <= 0) return;
    this.imgArray.set(rGBA, pos);
  }

  drawPixels(pixels) {
    pixels.forEach(([x, y, rGBA]) => this.putPixel(x, y, rGBA));
  }

  getImageDataArray() {
    return this.imgArray.toString();
  }

  putImageDataArray(imgDataArray) {
    const imageData = imgDataArray.split(',');
    this.imgArray.set(imageData);
  }
};
