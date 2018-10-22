const express = require('express');

const app = express();

const config = require('../config');

global.config = config;
const scraperController = require('./controllers/scraper');

app.use('/', async (req, res, next) => {
  req.props = Object.assign(req.query, req.body);
  next();
});

app.get('/', scraperController);

app.listen(config.ports.web);
