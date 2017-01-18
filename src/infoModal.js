require('./styles/infoModal.scss');

module.exports = class InfoModal {
  constructor(el) {
    this.el = el;
    this.el.className = 'info_modal show';

    this.closeEl = document.createElement('button');
    this.closeEl.innerHTML = '&#10006;';
    this.closeEl.className = 'info_modal_close';

    this.closeEl.onclick = () => {
      this.el.classList.remove('show');
    };

    this.el.innerHTML = `
      <div class="info_modal_content">
        <div>
          <p>To begin defacing the internet bathroom in full screen mode, click on the <span class="spray_icon icon"></span> after closing this, pick a color, and start vandalizing.</p>
          <p>If you're using this on an iPhone, press the share icon <span class="share_icon icon"></span> on the bottom of your screen and add this page to your home screen for the best internet hoodlum experience.</p>
          <p>Press 'ESC' or 'BACK' to exit fullscreen.</p>
        </div>
      </div>
    `;
    this.el.appendChild(this.closeEl);
  }
}
