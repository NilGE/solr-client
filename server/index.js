import express from 'express';
import config from '../config/config';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';

import webpackHotMiddleware from 'webpack-hot-middleware';

import webpackConfig from '../webpack.config.dev';
import apiRouter from './api/index';
import bodyParser from 'body-parser';

const app = express();

const compiler = webpack(webpackConfig);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(webpackMiddleware(compiler, {
  hot: true,
  publicPath: webpackConfig.output.publicPath,
  noInfo: true
}));
app.use(webpackHotMiddleware(compiler));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('*', (req, res) => {
  res.render('index', {
    content: 'dummy content'
  });
});

app.listen(config.port, config.host, () => {
  console.info('Magic happens at port ', config.port);
});
