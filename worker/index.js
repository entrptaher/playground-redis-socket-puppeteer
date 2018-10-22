/**
 * Socket to talk with process that manages browser instances
 */
const io = require('socket.io')('3000');

// Redis adapter makes sure all sockets on all servers get the data
const redisAdapter = require('socket.io-redis');

io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

io.on('connection', (socket) => {
  function roomExist(roomUUID) {
    return new Promise((resolve, reject) => {
      io.of('/').adapter.allRooms((err, rooms) => {
        if (err) {
          return reject(err);
        }
        if (rooms.find(e => e === roomUUID)) {
          resolve(true);
        }
        resolve(false);
      });
    });
  }

  console.log('Client connected', io.engine.clientsCount);

  socket.on('disconnect', () => {
    console.log('Client disconnected', io.engine.clientsCount);
  });

  socket.on('room', (room) => {
    socket.join(room);
  });

  socket.on('leave', (room) => {
    socket.leave(room);
  });

  socket.on('change', async (msg, fn) => {
    io.of('/').adapter.allRooms((err, rooms) => {
      if (rooms.find(e => e === msg.uuid)) {
        fn({ msg: 'room exist, will continue' });
        socket.to(msg.uuid).emit('change', msg);
      } else {
        fn({ msg: "room does not exist, won't continue" });
      }
    });
  });

  socket.on('exist', async (msg, fn) => {
    try {
      const doesRoomExist = await roomExist(msg.uuid);
      fn({ roomExist: doesRoomExist });
    } catch (error) {
      fn({ msg: 'Error Happened', error });
    }
  });
});

async function notifyJobQ(job, result) {
  const jobId = job.id;
  const { uuid } = job.data;
  console.log({ jobId, uuid, result });
  io.in(uuid).emit('cleanup', { jobId, uuid });
}

/**
 * Queue Processor
 */
const Queue = require('bull');

const scraperQueue = new Queue('simple scraper');
// Requiring the file will make it run on this context
// not requiring will make it sandboxed by bull
scraperQueue.process(require(`${__dirname}/scraper/index.js`));
// scraperQueue.on("completed", notifyJobQ).on("failed", notifyJobQ);
