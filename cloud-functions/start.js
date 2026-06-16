require('@babel/register')({
  presets: ['@babel/preset-env'],
  ignore: [/node_modules/]
});
require('./local_server.js');