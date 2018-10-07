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
    console.log("connect from", currentJob.id);
  });
  socket.on("disconnect", function() {
    console.log("disconnect from", currentJob.id);
  });

  socket.on("cleanup", async function(data) {
    if (data.jobId === currentJob.id) {
      console.log([data.jobId, currentJob.id]);
      try {
        const _wasBrowserKilled = await wasBrowserKilled(currentBrowser);
        if (!_wasBrowserKilled) {
          await currentPage.close();
          await currentBrowser.close();
        }
        if (currentJob.remove) {
          await currentJob.remove();
        }
        currentProcess.exit(0);
      } catch (e) {
        throw (`Cannot clean up`, e);
      }
    }
  });
};
