var Queue = require("bull");
var scraperQueue = new Queue("simple scraper");
var short = require("short-uuid");
var express = require("express");
var app = express();

const io = require("socket.io-client");
const socket = io("http://0.0.0.0:3000", {
  transports: ["websocket"] // Only websocket works
});
const asyncSocket = require("./modules/async-socket")(socket);

app.get("/", async function(req, res) {
  const { uuid = short().new(), url } = req.query;
  if (!url) return res.send({ error: "no url provided" });
  const exist = await asyncSocket("exist", { uuid });
  if (exist.roomExist) {
    console.log(exist);
    const resp = await asyncSocket("change", { url, uuid });
    return res.send({ message: "Room Exist", uuid, resp });
  }
  await scraperQueue.add({ url, uuid }, { attempts: 2, removeOnFail: true });
  res.send({ message: "Added to queue", uuid });
});

app.get("/change", async function(req, res) {
  const { uuid, url } = req.query;
  if (!url) return res.send({ error: "no url provided" });
  if (!uuid) return res.send({ error: "no uuid provided" });
  const resp = await asyncSocket("change", { url, uuid });
  res.send({ uuid, resp });
});

app.listen(3001);