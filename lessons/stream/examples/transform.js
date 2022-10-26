'use strict';

const stream = require('node:stream');
const fs = require('node:fs');
const path = require('node:path');

class ToUpperCaseStream extends stream.Transform {
  constructor(options = {}) {
    options = {
      ...options,
      decodeStrings: false
    };
    super(options);
  }
  _transform(chunk, encoding, callback) {
    const isUtf8 = ['utf-8', 'utf8'].includes(encoding);
    console.log(typeof chunk);
    if (!isUtf8) {
      this.emit('error', new Error('Only utf8 sources are supported'));
      callback();
    } else {
      console.log(chunk.length);
      this.push(chunk.toUpperCase());
      callback();
    }
  }
  // нужен если мы хотим записать какие-то дополнительные данные
  _flush(callback) {
    this.push('Wow!');
    callback();
  }
}


fs.createReadStream(path.join(__dirname, 'text.txt'), 'utf8')
  .pipe(new ToUpperCaseStream())
  .pipe(fs.createWriteStream(path.join(__dirname, 'textupper.txt')));

