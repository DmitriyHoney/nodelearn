'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const sendResponse = (res, status, content) => {
  res.statusCode = status;
  res.end(content);
};

const checkFileExist = (filePath) => new Promise((resolve, reject) => {
  fs.open(filePath, (err, fd) => {
    if (err) reject(false);
    else {
      fs.close(fd);
      resolve(true);
    }
  });
});

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/') return sendResponse(res, 200, 'Main Page');
    const filePathArr = req.url.split('/').filter((el) => el);
    const isUrlValid = filePathArr.length === 1;
    if (!isUrlValid) return sendResponse(res, 400, 'Nested files not support');
    const filePath = path.join(__dirname, 'files', filePathArr[0]);
    try {
      await checkFileExist(filePath);
      const rS = fs.createReadStream(filePath);
      res.statusCode = 200;
      rS.pipe(res);
    } catch (e) {
      return sendResponse(res, 404, 'Not found');
    }
  } catch (e) {
    return sendResponse(res, 500, 'Server error');
  }
});

module.exports = server;

