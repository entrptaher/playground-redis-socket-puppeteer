/**
 * Socket to talk with process that manages browser instances
 */
const io = require("socket.io")("3000");

// Redis adapter makes sure all sockets on all servers get the data
const redisAdapter = require("socket.io-redis");
io.adapter(redisAdapter({ host: "localhost", port: 6379 }));

io.on("connection", socket => {
  console.log("Client connected", io.engine.clientsCount);

  socket.on("disconnect", function() {
    console.log("Client disconnected", io.engine.clientsCount);
  });
});

async function notifyJobQ(job, result) {
  console.log({ jobId: job.id, result });
  io.emit("cleanup", { jobId: job.id });
}

/**
 * Queue Processor
 */
var Queue = require("bull");
var scraperQueue = new Queue("simple scraper");
// Requiring the file will make it run on this context
// not requiring will make it sandboxed by bull
scraperQueue.process(__dirname + "/scraper/index.js");
scraperQueue.on("completed", notifyJobQ).on("failed", notifyJobQ);
