const puppeteer = require("puppeteer");
const addClassMethods = require("@entrptaher/add-class-methods");
const extraFunctions = require("./modules/extra-functions");

module.exports = async function(job) {
  const { data } = job;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  /**
   * Hooks
   */
  /**
   * Hook: Management
   */
  // extra management hook to start/stop process from outside
  require("./socket")({
    currentJob: job,
    currentProcess: process,
    currentBrowser: browser,
    currentPage: page
  });
  /**
   * Hook: Puppeteer Methods
   */
  // Add new methods to Page class, it's available to modify at this point
  addClassMethods(page.constructor, extraFunctions);

  /**
   * Data Collection
   */
  // Navigation
  await page.goto(data.url);
  // Data Collection
  const collectedData = {
    collectedData: await page.data(),
    innerText: await page.innerText("h1"),
    innerHTML: await page.innerHTML("h1"),
    outerHTML: await page.outerHTML("h1")
  };

  // await browser.close();
  return collectedData;
};
