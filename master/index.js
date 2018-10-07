var Queue = require("bull");
var scraperQueue = new Queue("simple scraper");

var express = require("express");
var app = express();

app.get("/", async function(req, res) {
  await scraperQueue.add(
    { url: req.query.url },
    { attempts: 2, removeOnFail: true }
  );
  res.send("Added to queue");
});

app.listen(3001);
