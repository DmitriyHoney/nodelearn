'use strict';


// Usage
const LineSplitStream = require('./LineSplitStream');
const os = require('os');

const lines = new LineSplitStream({
  options: {
    encoding: 'utf-8',
  },
  separator: os.EOL,
});

let idx = 0;
function onData(line) {
  idx++;
  console.log(idx, line);
}

lines.on('data', onData);

lines.write(
  `первая строка${os.EOL}вторая строка${os.EOL}третья строка`, 'utf-8');

lines.end();
