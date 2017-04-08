import webpack from 'webpack';

export default {
  devtool: 'eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './client/index.js'
  ],
  output: {
    path: __dirname + '/public',
		filename: 'bundle.js',
		publicPath: '/'
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
				test: /\.json$/,
				include: __dirname + '/client',
				loader: 'json-loader'
			},
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['react-hot-loader', 'babel-loader']
      }
    ]
  }
};
