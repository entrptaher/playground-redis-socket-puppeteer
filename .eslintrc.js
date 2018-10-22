module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-restricted-syntax': 'off',
    camelcase: 'off',
    'max-len': 'off',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'no-await-in-loop': 'off',
    'no-loop-func': 'off',
    'class-methods-use-this': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 0,
  },
  env: {
    browser: true,
    node: true,
    jquery: true,
    mocha: true,
  },
};
