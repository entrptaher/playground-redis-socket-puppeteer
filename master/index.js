const Queue = require('bull');

const scraperQueue = new Queue('simple scraper');
const short = require('short-uuid');
const express = require('express');

const app = express();

const io = require('socket.io-client');
const config = require('../config');

const socket = io(`http://${config.host}:${config.ports.ws}`, {
  transports: ['websocket'], // Only websocket works
});
const asyncSocket = require('./modules/async-socket')(socket);

app.use('/', async (req, res, next) => {
  req.props = Object.assign(req.query, req.body);
  console.log(req.props);
  next();
});

app.get('/', async (req, res) => {
  const {
    uuid = short().new(), url, change, cleanup: cleanupData,
  } = req.props;
  const cleanup = String(cleanupData) === 'true';
  if (!url) return res.send({ error: 'no url provided' });
  if (change || cleanup) {
    if (!uuid) return res.send({ error: 'no uuid provided' });
  }
  const exist = await asyncSocket('exist', { uuid });
  console.log({ uuid, exist, cleanup });
  if (cleanup) {
    if (exist.roomExist) {
      const resp = await asyncSocket('cleanup', { uuid });
      return res.send({ message: 'Cleaning up', uuid, resp });
    }
    return res.send({ message: "room doesn't exist", uuid });
  }
  if (exist.roomExist || change) {
    const resp = await asyncSocket('change', { url, uuid });
    return res.send({ message: 'Room Exist', uuid, resp });
  }
  await scraperQueue.add({ url, uuid }, { attempts: 2, removeOnFail: true });
  return res.send({ message: 'Added to queue', uuid });
});

app.listen(config.ports.web);
