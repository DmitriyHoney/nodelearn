'use strict';

const fs = require('node:fs');
const path = require('node:path');
const filePath = path.join(__dirname, 'text.txt');

const isFileExist = (path) => new Promise((resolve, reject) => {
  fs.open(path, 'rs+', (err, fd)  => (
    err ? reject(err) : resolve(fd)
  ));
});

const { Writable } = require('node:stream');

class MyWritable extends Writable {
  constructor({ options, filename }) {
    super(options);
    console.log('constructor');
    this.filename = filename;
    this.fd = null;
    this.data = '';
  }
  _construct(cb) {
    console.log('_construct', this.options);
    isFileExist(this.filename)
      .then((fd) => {
        this.fd = fd;
        cb();
      })
      .catch(cb);
  }
  _write(chunk, encoding, callback) {
    if (chunk.split('').includes('ф')) {
      callback(new Error('Symb ф is not valid'));
    } else {
      callback();
    }
  }
  _final(cb) {
    console.log('_final');
    fs.close(this.fd, (err) => {
      if (err) console.log('fs.close error');
      else {
        console.log('fs.close success');
        this.fd = null;
      }
      cb();
    });
  }
}

const t = new MyWritable({
  options: {
    highWaterMark: 2,
    decodeStrings: false
  },
  filename: filePath
});
t.write('aaa');

/*
Т.е по сути при создании своих readable writable стримов
можем вклиниваться в их методы, а далее например валидировать,
не пропускать файлы определённого размера, расширения и т.п
*/
