'use strict';

const stream = require('node:stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor({ options = {}, limit = 8 }) {
    super(options);
    this.limit = limit; // bytes
    this.chunkLen = 0;
  }
  _transform(chunk, encoding, callback) {
    const isUtf8 = ['utf8', 'utf-8'].includes(encoding);
    if (!isUtf8) {
      this.emit('error', new Error('Encoding must be utf8'));
      callback();
    } else {
      this.chunkLen += chunk.length;
      if (this.chunkLen <= this.limit) {
        this.push(chunk);
        callback();
      } else {
        callback(new LimitExceededError());
      }
    }
  }
}

module.exports = LimitSizeStream;

