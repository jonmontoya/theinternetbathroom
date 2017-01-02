# [The Internet Bathroom](http://theinternetbathroom.com)

[![The Internet Bathroom](http://theinternetbathroom-assets.s3.amazonaws.com/theinternetbathroom.png)](http://theinternetbathroom.com)

[Demo](http://theinternetbathroom.com)

This is a fun little shared scrawl-space written over holiday, it gives the experience of vandalizing a multi user-public bathroom in real time. I put this together because I to write an end-to-end app out using a lot of the things I think are fun: node, vanilla.js, canvas, socket.io and aws.

## To Run Locally

Make sure you have redis installed on your machine, it uses it to route messaging and store image data. Run this commands, it'll default to a webpack-dev server running development mode:

`npm install && npm start`

## Todo

I have a few things left to do, yet:

- [ ] Add meta tags for social sharing.
- [ ] Add ico file.
- [ ] Clear wall for fresh graffiti.
- [ ] Better mobile experience.
  - [ ] Access to color changes in fullscreen mode.
  - [ ] Zoom to paint.
- [ ] Multiple brush sizes.
- [ ] Modify elastic beanstalk to allow ws connections and not default to xhr polling.
