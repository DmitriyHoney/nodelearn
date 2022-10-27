'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const LimitSizeStream = require('../task2/modules/LimitSizeStream');

const sendResponse = (res, status, content) => {
  res.statusCode = status;
  res.end(content);
};

const urlToArr = (url) => url.split('/').filter((el) => el);
const isNested = (url) => urlToArr(url).length > 1;
const getFileNameFromUrl = (url) => urlToArr(url)[0];
const getFilePath = (url) => (
  path.join(__dirname, 'files', getFileNameFromUrl(url)));
const isExist = (url) => fs.existsSync(getFilePath(url));


const getBody = (req) => new Promise((resolve, reject) => {
  const res = [];
  req
    .pipe(new LimitSizeStream({ limit: 25 }))
    .on('data', (chunk) => res.push(chunk))
    .on('end', () => resolve(Buffer.concat(res).toString()))
    .on('error', (err) => reject(err));
});

const validateRequest = (req) => {
  const { method, url } = req;
  if (method !== 'POST') return { status: 500, content: 'Only POST method' };
  if (isNested(url)) return { status: 400, content: 'Nested urls not support' };
  if (isExist(url)) return { status: 409, content: 'File already exist' };
  return false;
};

const server = http.createServer((req, res) => {
  const notValid = validateRequest(req);
  if (notValid) return sendResponse(res, notValid.status, notValid.content);
  // const writeStream = fs.createWriteStream();
  req.on('close', () => {
    fs.rmSync(getFilePath(req.url), { force: true });
    return;
  });
  getBody(req)
    .then((body) => {
      fs.writeFileSync(getFilePath(req.url), body, 'utf8');
      return sendResponse(res, 201, 'File will be created.');
    })
    .catch((err) => (err.constructor.name === 'LimitExceededError'
      ? sendResponse(res, 413, err.message)
      : sendResponse(res, 500, err.message)));
});

module.exports = server;
