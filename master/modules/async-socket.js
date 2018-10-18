module.exports = socket => async (channel, msg) => {
  return new Promise(resolve => {
    socket.emit(channel, msg, data => resolve(data));
  });
};
