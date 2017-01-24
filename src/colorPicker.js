require('./styles/colorPicker.scss');
require('./jscolor');

const EventEmitter = require('events');
const {
  LAST_COLOR_USED_STORAGE_KEY: lastColorUsedStorageKey,
} = require('./utils/constants');

module.exports = class ColorPicker extends EventEmitter {
  constructor(colorPickerEl) {
    super();

    this.buttonEl = document.createElement('BUTTON');
    this.buttonEl.className = 'color_picker_button';
    const inputEl = document.createElement('INPUT');
    inputEl.className = 'color_picker_input';
    this.picker = new jscolor(inputEl); // eslint-disable-line

    colorPickerEl.appendChild(inputEl);
    colorPickerEl.appendChild(this.buttonEl);

    this.buttonEl.onclick = () => {
      this.picker.show();
    };

    inputEl.onchange = () => {
      const newColor = `#${this.picker.toString()}`;
      this.changeColor(newColor);
      window.localStorage.setItem(lastColorUsedStorageKey, newColor);
    };

    const initColor = window.localStorage.getItem(lastColorUsedStorageKey) || '#00ff00';
    this.changeColor(initColor);
  }

  changeColor(color) {
    this.emit('color', color);
    this.buttonEl.style.backgroundColor = color;
  }
};
