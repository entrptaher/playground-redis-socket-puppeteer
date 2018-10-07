module.exports = function({
  currentJob,
  currentProcess,
  currentBrowser,
  currentPage
}) {
  const io = require("socket.io-client");
  const socket = io("http://0.0.0.0:3000", {
    transports: ["websocket"] // Only websocket works
  });

  async function wasBrowserKilled(browser) {
    const procInfo = await browser.process();
    return !!procInfo.signalCode;
  }

  socket.on("connect", function() {
    socket.emit("room", currentJob.data.uuid);
    console.log("connect from", currentJob.id);
  });
  socket.on("disconnect", function() {
    console.log("disconnect from", currentJob.id);
  });

  socket.on("change", function(data) {
    console.log({ data });
    currentPage.goto(data.url);
  });

  socket.on("cleanup", async function(data) {
    console.log([data.jobId, currentJob.id]);
    if (data.jobId === currentJob.id) {
      try {
        const _wasBrowserKilled = await wasBrowserKilled(currentBrowser);
        if (!_wasBrowserKilled) {
          await currentPage.close();
          await currentBrowser.close();
        }
        if (currentJob.remove) {
          await currentJob.remove();
        }
        socket.emit("leave", currentJob.data.uuid);
        // currentProcess.exit(0);
      } catch (e) {
        throw (`Cannot clean up`, e);
      }
    }
  });
};
