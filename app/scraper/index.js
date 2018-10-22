const puppeteer = require('puppeteer');
const addClassMethods = require('@entrptaher/add-class-methods');
const hooks = require('./hooks');

module.exports = async function scraper(job) {
  const { data } = job;
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  /**
   * Hooks
   */
  // extra management hook to start/stop process from outside
  const hookOptions = {
    currentJob: job,
    currentProcess: process,
    currentBrowser: browser,
    currentPage: page,
  };
  // prevent some basic headless detection
  await hooks.headlessDetection(hookOptions);

  // add talking using socket
  await hooks.socket(hookOptions);

  // Add new methods to Page class, it's available to modify at this point
  addClassMethods(page.constructor, hooks.extraFunctions);

  /**
   * Data Collection
   */
  // Navigation
  await page.goto(data.url);

  // Data Collection
  const collectedData = {
    collectedData: await page.data(),
    innerText: await page.innerText('h1'),
    innerHTML: await page.innerHTML('h1'),
    outerHTML: await page.outerHTML('h1'),
  };

  // await browser.close();
  return collectedData;
};
