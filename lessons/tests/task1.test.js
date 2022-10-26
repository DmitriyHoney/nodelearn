'use strict';
const {
  describe, test,
  beforeAll, afterAll
} = require('@jest/globals');
const axios = require('axios');
const assert = require('node:assert');
const PORT = 3000;

let closeServer, instance;

describe('Task 1', () => {
  beforeAll(() => {
    delete require.cache[require.resolve('../ls2/task1/index.js')];
    const { serverClose } = require('../ls2/task1/index.js');
    closeServer = serverClose;
    instance = axios.create({
      validateStatus: (status) => [200, 400, 404, 500].includes(status),
      baseURL: `http://localhost:${PORT}/`
    });
  });
  test('[GET]: /', async () => {
    const res = await instance.get('/');
    assert.equal(res.status, 200);
    assert.equal(res.data, 'Main Page');
  });
  test('[GET]: /fileExist.css', async () => {
    const res = await instance.get('/index.css');
    assert.equal(res.status, 200);
  });
  test('[GET]: /notExistFile.js', async () => {
    const res = await instance.get('/notExistFile.js');
    assert.equal(res.status, 404);
    assert.equal(res.data, 'Not found');
  });
  test('[GET]: /nested/files/notsupport.js', async () => {
    const res = await instance.get('/nested/files/notsupport.js');
    assert.equal(res.status, 400);
    assert.equal(res.data, 'Nested files not support');
  });
  afterAll(() => {
    closeServer();
    instance = null;
  });
});
