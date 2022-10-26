'use strict';
const {
  describe, test,
  beforeEach, afterEach,

} = require('@jest/globals');
// const axios = require('axios');
const assert = require('node:assert');
// const PORT = 3000;

// let closeServer, instance;
const fs = require('node:fs');
const path = require('node:path');

const LimitSizeStream = require('../ls2/task2/modules/LimitSizeStream');
let limitStream = null;

describe('Task 2', () => {
  describe('Test LimitSizeStream class', () => {
    beforeEach(() => {
      limitStream = new LimitSizeStream({ limit: 25 });
    });
    afterEach(() => {
      limitStream = null;
    });
    test('check file than less than limit 25 Bytes', (done) => {
      const filePath = path.join(__dirname, '../ls2/task2/files/test.text.txt');
      if (!fs.existsSync(filePath)) throw new Error('File text.txt not found');
      fs.createReadStream(filePath)
        .pipe(limitStream)
        .on('finish', () => done())
        .on('error', (err) => {
          done();
          assert.equal(err, null);
        });
    });
    test('check file than more than limit 25 Bytes', (done) => {
      const filePath = path.join(__dirname, '../ls2/task2/files/largeImg.jpg');
      if (!fs.existsSync(filePath)) throw new Error('File text.txt not found');
      fs.createReadStream(filePath)
        .pipe(limitStream)
        .on('error', (err) => {
          done();
          assert.equal(err, err);
        });
    });
  });
});
