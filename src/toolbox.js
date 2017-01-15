require('./styles/toolbox.scss');
const ColorPicker = require('./colorPicker');
const EventEmitter = require('events');

module.exports = class Toolbox extends EventEmitter {
  constructor(opts) {
    super();
    const { el } = opts;

    this.editing = false;

    this.el = el;
    this.el.className = 'graffiti_toolbox';

    this.drawButtonEl = document.createElement('button');
    this.drawButtonEl.className = 'graffiti_button edit';
    this.drawButtonEl.onclick = this.setEditing.bind(this);

    this.toolboxEl = document.createElement('div');
    this.colorPickerEl = document.createElement('div');
    this.colorPickerEl.className = 'graffiti_button';

    this.colorPicker = new ColorPicker(this.colorPickerEl);
    this.colorPicker.on('color', color => this.emit('color', color));


    this.toolboxEl.appendChild(this.colorPickerEl);

    this.el.appendChild(this.drawButtonEl);
    this.el.appendChild(this.toolboxEl);

    this.unsetEditing();
  }

  setEditing() {
    this.emit('editing', true);
    this.toolboxEl.classList.remove('hide');
    this.drawButtonEl.classList.add('hide');
  }

  unsetEditing() {
    this.toolboxEl.classList.add('hide');
    this.drawButtonEl.classList.remove('hide');
  }
};
