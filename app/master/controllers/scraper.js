/* global config */

const Queue = require('bull');
const short = require('short-uuid');
const io = require('socket.io-client');

// initialization
const scraperQueue = new Queue('simple scraper');
const socket = io(`http://${config.host}:${config.ports.ws}`, {
  transports: ['websocket'], // Only websocket works
});
const asyncSocket = require('../modules/async-socket')(socket);

/**
 * Scraper Controller
 * @param {Object} req
 * @param {Object} res
 */
const scraper = async (req, res) => {
  // Get all Parameters
  const {
    uuid = short().new(), url, change, cleanup: cleanupData,
  } = req.props;
  const cleanup = String(cleanupData) === 'true';

  // Parameter Verification
  if (!url) return res.send({ error: 'no url provided' });
  if (change || cleanup) {
    if (!uuid) return res.send({ error: 'no uuid provided' });
  }

  // Check if the uuid exist in any of the socket workers
  const exist = await asyncSocket('exist', { uuid });
  console.log({ uuid, exist, cleanup });

  // if cleanup is needed
  if (cleanup) {
    if (exist.roomExist) {
      const resp = await asyncSocket('cleanup', { uuid });
      return res.send({ message: 'Cleaning up', uuid, resp });
    }
    return res.send({ message: "room doesn't exist", uuid });
  }

  // if changing is mentioned
  if (exist.roomExist || change) {
    const resp = await asyncSocket('change', { url, uuid });
    return res.send({ message: 'Room Exist', uuid, resp });
  }

  // otherwise finally add to queue
  await scraperQueue.add({ url, uuid }, { attempts: 2, removeOnFail: true });
  return res.send({ message: 'Added to queue', uuid });
};
module.exports = scraper;
