'use strict';

const stream = require('node:stream');
const fs = require('node:fs');
const path = require('node:path');



class MyReadable extends stream.Readable {
  constructor({ options, filename }) {
    super(options);
    this.filename = filename;
    this.fd = null;
  }
  _construct(cb) {
    console.log('_construct');
    fs.open(this.filename, 'rs+', (err, fd) => {
      if (err) cb(err);
      else {
        this.fd = fd;
        cb();
      }
    });
  }
  _destroy(err, callback) {
    if (this.fd) {
      fs.close(this.fd, (er) => callback(er || err));
    } else {
      callback(err);
    }
  }
  _read(n) {
    const buf = Buffer.alloc(n);
    fs.read(this.fd, buf, 0, n, null, (err, bytesRead) => {
      if (err) {
        this.push(null);
        this.destroy(err);
      } else {
        bytesRead > 0 ? this.push(buf.subarray(0, bytesRead)) : this.push(null);
      }
    });
  }
}


const filePath = path.join(__dirname, 'text.txt');
console.log(filePath);
const t = new MyReadable({
  options: {
    highWaterMark: 2,
    decodeStrings: false
  },
  filename: filePath
});
t.pipe(fs.createWriteStream(path.join(__dirname, 'ttt.txt')));

/*
Т.е по сути при создании своих readable writable стримов
можем вклиниваться в их методы, а далее например валидировать,
не пропускать файлы определённого размера, расширения и т.п
*/
