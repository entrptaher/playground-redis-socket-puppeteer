module.exports = socket => async (channel, msg) => new Promise((resolve) => {
  socket.emit(channel, msg, data => resolve(data));
});
