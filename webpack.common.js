const path = require('path');

module.exports = {
  entry: {
    app: './js/app/App.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/app/App.js',
  },
};
