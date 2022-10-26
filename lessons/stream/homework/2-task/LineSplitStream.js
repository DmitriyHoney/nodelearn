'use strict';

const stream = require('node:stream');

class LineSplitStream extends stream.Transform {
  constructor({ options = {}, separator }) {
    super(options);
    this.separator = separator;
  }
  _transform(chunk, encoding, callback) {
    const commonChunk = chunk.toString('utf-8');
    const chunkHasSeparator = commonChunk.indexOf(this.separator) >= 0;
    if (!chunkHasSeparator) this.push(chunk);
    else {
      commonChunk
        .split(this.separator)
        .forEach((el) => this.push(el));
    }
    callback();
  }
}

module.exports = LineSplitStream;
