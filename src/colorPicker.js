require('./styles/colorPicker.scss');
require('./jscolor');

const EventEmitter = require('events');

module.exports = class ColorPicker extends EventEmitter {
  constructor(colorPickerEl) {
    super();

    const buttonEl = document.createElement('BUTTON');
    buttonEl.className = 'color_picker_button';
    const inputEl = document.createElement('INPUT');
    inputEl.className = 'color_picker_input';
    const picker = new jscolor(inputEl); // eslint-disable-line

    colorPickerEl.appendChild(inputEl);
    colorPickerEl.appendChild(buttonEl);

    buttonEl.onclick = () => {
      picker.show();
    };

    inputEl.onchange = () => {
      const color = `#${picker.toString()}`;
      this.emit('color', color);
      buttonEl.style.backgroundColor = color;
    };
  }
};
