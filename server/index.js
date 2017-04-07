import express from 'express';
import config from '../config/config';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';

// add webpack hot middleware
import webpackHotMiddleware from 'webpack-hot-middleware';

import webpackConfig from '../webpack.config.dev';

const app = express();

// use hot webpack module to hot reload page
const compiler = webpack(webpackConfig);
app.use(webpackMiddleware(compiler, {
  hot: true,
  publicPath: webpackConfig.output.publicPath,
  noInfo: true
}));
app.use(webpackHotMiddleware(compiler));

app.set('view engine', 'ejs');

app.get('*', (req, res) => {
  res.render('index', {
    content: 'dummy content'
  });
});

app.listen(config.port, config.host, () => {
  console.info('Magic happens at port ', config.port);
});
