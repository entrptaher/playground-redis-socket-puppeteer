const Queue = require('bull');

const { cleanup } = require('./socket');
/**
 * Queue Processor
 */
const scraperQueue = new Queue('simple scraper');
// Requiring the file will make it run on this context
// not requiring will make it sandboxed by bull
scraperQueue.process(require(`${__dirname}/../scraper/index.js`));
scraperQueue.on('completed', cleanup).on('failed', cleanup);
