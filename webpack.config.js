import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';
import WebpackExtensionManifestPlugin from 'webpack-extension-manifest-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => ({
  mode: argv.mode || 'production',
  context: path.resolve(__dirname, 'src'),
  entry: {
    reddit: './content-scripts/reddit.ts',
    x: './content-scripts/x.ts',
    options: './options-ui/index.ts',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: [/node_modules/],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './options-ui/index.html',
      filename: 'options.html',
      chunks: ['options'],
    }),
    new WebpackExtensionManifestPlugin({
      config: {
        base: './manifest.json',
      },
      pkgJsonProps: ['version', 'description'],
      minify: argv.mode === 'production',
    }),
    new CopyPlugin({
      patterns: [{ from: path.resolve(__dirname, './assets'), to: 'assets' }],
    }),
  ],
  devtool: argv.mode === 'development' ? 'source-map' : false,
});
