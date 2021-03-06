async function headlessDetection({ currentPage }) {
  return currentPage.evaluateOnNewDocument(() => {
    // overwrite webdriver to be missing
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    // overwrite the `languages` property to use a custom getter
    Object.defineProperty(navigator, 'languages', {
      get() {
        return ['en-US', 'en'];
      },
    });

    // overwrite the `plugins` property to use a custom getter
    Object.defineProperty(navigator, 'plugins', {
      get() {
        // this just needs to have `length > 0`, but we could mock the plugins too
        return [1, 2, 3, 4, 5];
      },
    });
  });
}

module.exports = headlessDetection;
