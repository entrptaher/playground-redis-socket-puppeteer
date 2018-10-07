var Queue = require("bull");
var scraperQueue = new Queue("simple scraper");
var short = require("short-uuid");
var express = require("express");
var app = express();

const io = require("socket.io-client");
const socket = io("http://0.0.0.0:3000", {
  transports: ["websocket"] // Only websocket works
});

app.get("/", async function(req, res) {
  const { uuid = short().new(), url } = req.query;
  await scraperQueue.add({ url, uuid }, { attempts: 2, removeOnFail: true });
  res.send({ message: "Added to queue", uuid });
});

async function asyncSocket(channel, msg) {
  return new Promise(resolve => {
    socket.emit(channel, msg, data => resolve(data));
  });
}

app.get("/change", async function(req, res) {
  const { uuid, url } = req.query;
  const resp = await asyncSocket("change", { url, uuid });
  console.log({ resp });
  res.send({ uuid });
});

app.listen(3001);
