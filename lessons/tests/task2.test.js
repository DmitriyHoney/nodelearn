'use strict';
const {
  describe, test,
  beforeEach, afterEach,
  beforeAll, afterAll,
} = require('@jest/globals');
const axios = require('axios');
const assert = require('node:assert');

const fs = require('node:fs');
const path = require('node:path');

const LimitSizeStream = require('../ls2/task2/modules/LimitSizeStream');


describe('Task 2', () => {
  describe('Test LimitSizeStream class', () => {
    let limitStream = null;
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
  describe('Server endpoints', () => {
    let server = null;
    let instance = null;
    const PORT = 3001;
    const NOT_FAILED_CODES = [200, 201, 400, 404, 409, 413, 500];
    beforeAll(() => {
      delete require.cache[require.resolve('../ls2/task2/index')];
      server = require('../ls2/task2/index');
      server.listen(PORT);
      instance = axios.create({
        validateStatus: (status) => NOT_FAILED_CODES.includes(status),
        baseURL: `http://localhost:${PORT}/`
      });
    });
    test('Only POST allowed', async () => {
      const resGet = await instance.get('/');
      assert.equal(resGet.status, 500);
      assert.equal(resGet.data, 'Only POST method');

      const resPut = await instance.put('/');
      assert.equal(resPut.status, 500);
      assert.equal(resPut.data, 'Only POST method');

      const resDelete = await instance.put('/');
      assert.equal(resDelete.status, 500);
      assert.equal(resDelete.data, 'Only POST method');
    });
    test('Nested urls forbidden', async () => {
      const res1 = await instance.post('/file1/nested/file.txt');
      assert.equal(res1.status, 400);
      assert.equal(res1.data, 'Nested urls not support');

      const res2 = await instance.post('/file1/file.txt');
      assert.equal(res2.status, 400);
      assert.equal(res2.data, 'Nested urls not support');
    });
    test('If file exist than 409', async () => {
      const res = await instance.post('/test.text.txt');
      assert.equal(res.status, 409);
      assert.equal(res.data, 'File already exist');
    });
    test('If req.body > 25 Bytes 413', async () => {
      const res = await instance.post('/new.text.txt', {
        color: 'red',
        model: 'Tesla',
        year: 2022,
        maxSpeed: 250,
        description: 'Hello, I`m Tesla!'
      });
      assert.equal(res.status, 413);
      assert.equal(res.data, 'Limit has been exceeded.');
    });
    test('If req.body < 25 Bytes file will be create', async () => {
      const filePath = path.join(__dirname, '../ls2/task2/files/new.txt');
      fs.rmSync(filePath, { force: true });
      const res = await instance.post('new.txt', '{\r\n    t: "t1"\r\n}');
      assert.equal(res.status, 201);
      assert.equal(res.data, 'File will be created.');
    });
    afterAll(() => {
      server.close();
      instance = null;
      server = null;
    });
  });
});
