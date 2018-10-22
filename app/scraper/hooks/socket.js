/* global config */

function socketWalker({ currentJob, currentBrowser, currentPage }) {
  const io = require('socket.io-client');
  const socket = io(`http://${config.host}:${config.ports.ws}`, {
    transports: ['websocket'], // Only websocket works
  });

  async function wasBrowserKilled(browser) {
    const procInfo = await browser.process();
    return !!procInfo.signalCode;
  }

  socket.on('connect', () => {
    socket.emit('room', currentJob.data.uuid);
    console.log('connect from', currentJob.id);
  });

  socket.on('disconnect', () => {
    console.log('disconnect from', currentJob.id);
  });

  socket.on('change', (data) => {
    console.log({ data });
    currentPage.goto(data.url);
  });

  socket.on('cleanup', async (data) => {
    if (data.jobId === currentJob.id || data.uuid === currentJob.data.uuid) {
      try {
        const browserKilled = await wasBrowserKilled(currentBrowser);
        if (!browserKilled) {
          await currentPage.close();
          await currentBrowser.close();
        }
        await currentJob.remove();
        socket.emit('leave', currentJob.data.uuid);
        // currentProcess.exit(0);
      } catch (e) {
        throw ('Cannot clean up', e);
      }
    }
  });
}

module.exports = socketWalker;
