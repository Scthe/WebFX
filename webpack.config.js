const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const ROOT = path.resolve( __dirname, 'src' );
const DESTINATION = path.resolve( __dirname, 'dist' );

const config = ({mode, isProd}) => ({
    mode,

    context: ROOT,

    entry: {
        'main': './main.ts'
    },

    output: {
        filename: '[name].bundle.js',
        path: DESTINATION
    },

    performance: {
      maxEntrypointSize: 300 * 1024, // 250kb
    },

    resolve: {
        extensions: ['.ts', '.js'],
        modules: [ ROOT, 'node_modules' ],
        alias: {
            // typescript aliases are in tsconfig.json
        },
    },

    module: {
        rules: [
            // PRE-LOADERS
            { enforce: 'pre', test: /\.jsx?$/, use: 'source-map-loader' },
            { enforce: 'pre', test: /\.tsx?$/, use: 'tslint-loader', exclude: /node_modules/ },
            // LOADERS
            { test: /\.tsx?$/, loader: 'awesome-typescript-loader', exclude: [ /node_modules/ ] },
            { test: /\.(glsl|frag|vert)$/, loader: 'webpack-glsl-loader', },
            { test: /\.(png|jpg|gif)$/, use: 'url-loader?limit=15000&name=[name]-[hash].[ext]', exclude: /node_modules/ },
            { test: /\.obj$/, loader: 'file-loader', exclude: [ /node_modules/ ] },
        ],
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env': { // just in case, webpack4 changed this. (argv.mode is not very documented, so I don't trust docs for this)
          'NODE_ENV': JSON.stringify(mode),
          'DEBUG': !isProd,
        }
      }),
      new HtmlWebpackPlugin({ // create HTML file as part of webpack output. Also injects all chunks
        template: 'index.html',
        sourceMap: false,
      }),
    ],

});

const configProd = config => {
  config.plugins.unshift(
    new CleanWebpackPlugin(),
  );

  return config;
};

const configDev = config => {
  config.devServer = {
    hot: true,
    disableHostCheck: true, // TODO remove me https://github.com/webpack/webpack-dev-server/issues/1604
    stats: 'minimal',
    noInfo: true,
  };
  config.devtool = 'cheap-module-source-map';
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  );
  return config;
};

module.exports = (env, argv) => {
  const mode = argv.mode;
  const opts = { mode, isProd: mode === 'production' };
  console.log('MODE:', JSON.stringify(opts));

  const cfg = config(opts);

  return opts.isProd
    ? configProd(cfg)
    : configDev(cfg);
}
