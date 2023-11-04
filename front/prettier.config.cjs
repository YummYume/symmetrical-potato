/** @type {import("prettier").Config} */
module.exports = {
  useTabs: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  quoteProps: 'consistent',
  plugins: ['prettier-plugin-tailwindcss'],
};
