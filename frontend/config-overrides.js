const { override, addPostcssPlugins } = require('customize-cra');

// Use the addPostcssPlugins helper
// IMPORTANT: Use require('@tailwindcss/postcss') here, similar to postcss.config.js
module.exports = override(
  addPostcssPlugins([
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ])
);