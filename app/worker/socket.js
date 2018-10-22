/**
 * Socket to talk with process that manages browser instances
 */
const socketIO = require('socket.io');

// Redis adapter makes sure all sockets on all servers get the data
const redisAdapter = require('socket.io-redis');
const config = require('../config');

global.config = config;

const io = socketIO(config.ports.ws);
io.adapter(redisAdapter(config.redis));

io.on('connection', (socket) => {
  function getRoom(roomUUID) {
    return new Promise((resolve, reject) => {
      io.of('/').adapter.allRooms((err, rooms) => {
        if (err) {
          return reject(err);
        }
        return resolve(rooms.find(e => e === roomUUID));
      });
    });
  }
  function roomExist(roomUUID) {
    return new Promise((resolve, reject) => {
      io.of('/').adapter.allRooms((err, rooms) => {
        if (err) {
          return reject(err);
        }
        if (rooms.find(e => e === roomUUID)) {
          resolve(true);
        }
        return resolve(false);
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

  socket.on('cleanup', (data, fn) => {
    console.log('Should Clean up', data.uuid);
    fn(emitCleanup(data));
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

async function emitCleanup({ jobId, uuid }) {
  return io.in(uuid).emit('cleanup', { jobId, uuid });
}

async function cleanup(job = {}, result, socketUuid) {
  const jobId = job.id;
  const { uuid = socketUuid } = job.data;
  console.log({ jobId, uuid, result });
  io.in(uuid).emit('cleanup', { jobId, uuid });
}

module.exports = { io, cleanup };
