const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const Canvas = require('canvas');

const resizeScale = 2;
const localPath = path.join(__dirname, '../theinternetbathroom.png');

function copyToS3() {
  const cmd = spawn(path.join(__dirname, '../node_modules/.bin/s3-deploy'), [localPath, '--cwd', path.join(__dirname, '..'), '--bucket', process.env.THE_INTERNET_BATHROOM_APP_BUCKET]);

  cmd.stdout.on('data', (data) => {
    console.log(`Updating Meta Image: ${data}`);
  });

  cmd.stderr.on('data', (data) => {
    console.log(`Updating Meta Image Error: ${data}`);
  });
}

module.exports = function updateMetaImage(canvas) {
  const resizeCanvas = new Canvas();
  const resizeContext = resizeCanvas.getContext('2d');

  resizeCanvas.width = canvas.width * resizeScale;
  resizeCanvas.height = canvas.height * resizeScale;
  resizeContext.scale(resizeScale, resizeScale);
  resizeContext.drawImage(canvas, 0, 0);

  const out = fs.createWriteStream(localPath);
  const stream = resizeCanvas.pngStream();

  stream.on('data', (chunk) => {
    out.write(chunk);
  });

  stream.on('end', () => {
    out.end();
  });

  out.on('finish', () => {
    copyToS3();
  });
};
