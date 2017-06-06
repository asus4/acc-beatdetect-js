/*global module*/

module.exports = {
  entry: './src/main.js',
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
        test: /\.styl$/,
        loaders: ['style-loader', 'css-loader', 'autoprefixer-loader', 'stylus-loader']
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader?self'
      },
    ]
  },
  devServer: {
    contentBase: 'public',
    host: '0.0.0.0',
    hot: true,
    disableHostCheck: true,
  },
};