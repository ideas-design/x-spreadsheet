//* global window */
import { h } from './element';
import Suggest from './suggest';
// import { mouseMoveUp } from '../event';

function editorInputEventHandler(evt) {
  const v = evt.target.value;
  this.inputText = v;
  const start = v.lastIndexOf('=');
  // console.log('start:', start, v.substring(start));
  if (start !== -1) {
    this.suggest.search(v.substring(start + 1));
  } else {
    this.suggest.hide();
  }
}

function editorSetTextareaRange(position) {
  const { textEl } = this;
  textEl.el.setSelectionRange(position, position);
  setTimeout(() => {
    textEl.el.focus();
  }, 0);
}

function editorSetText(text, position) {
  const { textEl, textlineEl } = this;
  textEl.val(text);
  textlineEl.html(text);
  editorSetTextareaRange.call(this, position);
}

function suggestItemClick(it) {
  const { inputText } = this;
  const start = inputText.lastIndexOf('=');
  const sit = inputText.substring(0, start + 1);
  let eit = inputText.substring(start + 1);
  if (eit.indexOf(')') !== -1) {
    eit = eit.substring(eit.indexOf(')'));
  } else {
    eit = '';
  }
  this.inputText = `${sit + it.key}(`;
  // console.log('inputText:', this.inputText);
  const position = this.inputText.length;
  this.inputText += `)${eit}`;
  editorSetText.call(this, this.inputText, position);
}

export default class Editor {
  constructor(formulas) {
    this.suggest = new Suggest(formulas, 180, (it) => {
      suggestItemClick.call(this, it);
    });
    this.el = h('div', 'xss-editor').children(
      this.textEl = h('textarea', '')
        .on('input', evt => editorInputEventHandler.call(this, evt)),
      this.textlineEl = h('div', 'textline'),
      this.suggest.el,
    ).hide();
    this.suggest.bindInputEvents(this.textEl);

    this.cell = null;
    this.inputText = '';
    this.change = () => {};
  }

  clear() {
    const { cell } = this;
    const cellText = (cell && cell.text) || '';
    if (cellText !== this.inputText) {
      this.change(this.inputText);
    }
    this.cell = null;
    this.inputText = '';
    this.el.hide();
    this.textEl.val('');
    this.textlineEl.html('');
  }

  setOffset(offset, suggestPosition = 'top') {
    const {
      textEl, el, suggest,
    } = this;
    if (offset) {
      const {
        left, top, width, height,
      } = offset;
      el.offset({ left, top });
      textEl.offset({ width: width - 9, height: height - 3 });
      const sOffset = { left: 0 };
      sOffset[suggestPosition] = height;
      suggest.setOffset(sOffset);
    }
  }

  setCell(cell) {
    this.el.show();
    this.cell = cell;
    const text = (cell && cell.text) || '';
    this.inputText = text;
    editorSetText.call(this, text, text.length);
  }
}