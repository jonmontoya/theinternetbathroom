# [The Internet Bathroom](http://theinternetbathroom.com)

[![The Internet Bathroom](http://theinternetbathroom-assets.s3.amazonaws.com/theinternetbathroom.png)](http://theinternetbathroom.com)

[Demo](http://theinternetbathroom.com)

This is a fun little shared scrawl-space written over holiday, it gives the experience of vandalizing a multi user-public bathroom in real time. I put this together because I to write an end-to-end app out using a lot of the things I think are fun: node, vanilla.js, canvas, socket.io and aws.

## To Run Locally

Make sure you have redis installed on your machine, it uses it to route messaging and store image data. Run these commands, it'll default to a webpack-dev server running development mode:

### Install Cairo (Mac)

```
xcode-select --install
brew install pkgconfig
brew install pixman
brew install libjpeg
brew install giflib
brew install cairo
```

### Install NPM Packages and Start Server

`npm install && npm start`

## Deploy

This app requires you to have an AWS account and an S3 bucket setup

## Todo

I have a few things left to do, yet:

- [ ] Update ReadMe
  - [ ] Cairo install for Linux
- [ ] Restart server on server src change. (gulp?)
- [ ] Re-add redis socket.io adapter for scalability.
- [ ] Auto create and deploy S3 bucket through EB configs.
- [x] Add meta tags for social sharing.
- [ ] Add ico file.
- [ ] Fullscreen mode for mobile.
- [x] Meteor erase feature.
- [ ] Multiple brush sizes.
- [ ] Modify elastic beanstalk to allow ws connections and not default to xhr polling.
