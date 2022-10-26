'use strict';
// Usage
const LimitSizeStream = require('./LimitSizeStream');
const fs = require('node:fs');
const path = require('node:path');

const limitedStream = new LimitSizeStream({
  limit: 12,
  options: {
    decodeStrings: false
  }
}); // 8 байт
const outStream = fs.createWriteStream(
  path.join(__dirname, 'out.txt'), 'utf-8');

limitedStream.pipe(outStream);


// 'hello' - это 5 байт, поэтому эта строчка целиком записана в файл
limitedStream.write('hello', 'utf8');

// ошибка LimitExceeded! в файле осталось только hello
setTimeout(() => {
  limitedStream.write(' world', 'utf8');
}, 10);
