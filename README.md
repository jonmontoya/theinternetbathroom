# [The Internet Bathroom](http://theinternetbathroom.com)

[![The Internet Bathroom](http://qlip-photo-share.s3.amazonaws.com/theinternetbathroom.gif)](http://theinternetbathroom.com)

[Website](http://theinternetbathroom.com)

This is a fun little shared scrawl-space written over holiday, and put in more than a little work since. It gives the experience of vandalizing a multi user-public pixelated bathroom in real time. I put this together because I to write an end-to-end app out using a lot of the things I think are fun: node, vanilla.js, canvas, socket.io and aws.

## To Run Locally

Make sure you have redis installed on your machine, it uses it to route messaging and store image data. Run these commands, it'll default to a webpack-dev server running development mode:

### Install Redis & Cairo

#### Mac

```
brew install redis
brew install pkg-config cairo libpng jpeg giflib
```

### Ubuntu

```
sudo apt-get install redis
sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
```

### Install NPM Packages and Start Server

`npm install && npm start`

### Visit The Internet Bathroom
[http://localhost:8081](http://localhost:8081)

## Todo

I have a few things left to do, yet:
- [ ] Add testing.
- [ ] Cleanup UI.
  - [ ] Add cookie to not display instruction screen after first read.
  - [ ] Add cookie to save last color picked.
  - [ ] Send data and remove event listener when mouse leaves canvas in draw state.
- [ ] Re-request screen init if not received 5 secs after the first page load.
- [ ] Restart server on server src change. (gulp?)
- [ ] Auto create and deploy S3 bucket through EB configs.
- [ ] Modify elastic beanstalk nginx configs to allow ws connections and not default to xhr polling.
