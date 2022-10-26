'use strict';

const stream = require('node:stream');

class LimitSizeStream extends stream.Transform {
  constructor({ options, limit = 1048576 }) {
    super(options);
    this.size = 0;
    this.limitSize = limit; // default 1048576B === 1Mb
  }
  _transform(chunk, encoding, callback) {
    this.size += chunk.length;
    if (this.size < this.limitSize) {
      this.push(chunk);
      callback();
    } else {
      callback();
      const err = new Error(`File more than ${this.limitSize} Bytes`);
      this.emit('error', err);
    }
  }
}

module.exports = LimitSizeStream;
