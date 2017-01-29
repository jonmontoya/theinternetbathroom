const GraffitiCanvas = require('../../src/utils/graffitiCanvas');

describe('graffitiCanvas', () => {
  describe('.constructor', () => {
    it('creates an image data array with correct length', () => {
      const graffitiCanvas = new GraffitiCanvas(2, 2);
      expect(graffitiCanvas.imgArray instanceof Uint32Array).toBe(true);
      expect(graffitiCanvas.imgArray.length).toBe(16);
    });

    it('creates an image data array with initial image data', () => {
      const imgData = '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15';
      const graffitiCanvas = new GraffitiCanvas(2, 2, imgData);
      expect(graffitiCanvas.imgArray.toString()).toEqual(imgData);
    });
  });

  describe('.putPixel', () => {
    it('inserts rgba data in correct location', () => {
      const graffitiCanvas = new GraffitiCanvas(2, 2);
      const rGBA = [1, 2, 3, 4];
      graffitiCanvas.putPixel(1, 1, rGBA);
      expect(graffitiCanvas.imgArray.slice(12).toString()).toEqual(rGBA.toString());
    });
  });

  describe('.drawPixels', () => {
    it('inserts rgba data in correct locations', () => {
      const graffitiCanvas = new GraffitiCanvas(2, 2);
      const rGBA1 = [5, 6, 7, 8];
      const rGBA2 = [1, 2, 3, 4];
      const pixles = [
        [0, 0, rGBA1],
        [1, 1, rGBA2],
      ];

      graffitiCanvas.drawPixels(pixles);
      expect(graffitiCanvas.imgArray.slice().toString()).toEqual('5,6,7,8,0,0,0,0,0,0,0,0,1,2,3,4');
    });
  });

  describe('.getImageDataArray', () => {
    it('returns expected rgba data', () => {
      const imgData = '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15';
      const graffitiCanvas = new GraffitiCanvas(2, 2, imgData);
      expect(graffitiCanvas.getImageDataArray()).toEqual(imgData);
    });
  });
});
