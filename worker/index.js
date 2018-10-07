/**
 * Socket to talk with process that manages browser instances
 */
const io = require("socket.io")("3000");

// Redis adapter makes sure all sockets on all servers get the data
const redisAdapter = require("socket.io-redis");
io.adapter(redisAdapter({ host: "localhost", port: 6379 }));

console.log(io);

io.on("connection", socket => {
  console.log("Client connected", io.engine.clientsCount);

  socket.on("disconnect", function() {
    console.log("Client disconnected", io.engine.clientsCount);
  });

  socket.on("room", function(room) {
    socket.join(room);
  });

  socket.on("leave", function(room) {
    socket.leave(room);
  });

  socket.on("change", async (msg, fn) => {
    io.of("/").adapter.allRooms(function(err, rooms) {
      if (rooms.find(e => e === msg.uuid)) {
        fn({ msg: "room exist, will continue" });
        socket.to(msg.uuid).emit("change", msg);
      } else {
        fn({ msg: "room does not exist, won't continue" });
      }
    });
  });
});

async function notifyJobQ(job, result) {
  const jobId = job.id;
  const uuid = job.data.uuid;
  console.log({ jobId, uuid, result });
  io.in(uuid).emit("cleanup", { jobId, uuid });
}

/**
 * Queue Processor
 */
var Queue = require("bull");
var scraperQueue = new Queue("simple scraper");
// Requiring the file will make it run on this context
// not requiring will make it sandboxed by bull
scraperQueue.process(require(__dirname + "/scraper/index.js"));
scraperQueue; //.on("completed", notifyJobQ).on("failed", notifyJobQ);
