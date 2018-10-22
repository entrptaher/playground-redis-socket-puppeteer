// Our extra methods that has access to the page instance
module.exports = extraFunctions = [
  // just some simple functions to get title and url
  async function data() {
    return { title: await this.title(), url: await this.url() };
  },

  // synthetic sugar for innerText as asked
  async function innerText(selector) {
    return this.$eval(selector, e => e.innerText);
  },

  // synthetic sugar for innerHTML as asked
  async function innerHTML(selector) {
    return this.$eval(selector, e => e.innerHTML);
  },

  // More examples
  async function outerHTML(selector) {
    return this.$eval(selector, e => e.outerHTML);
  }
];