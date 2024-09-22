import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';
  
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
  
export default {
  mode: process.env.NODE_ENV || 'production',
  context: path.resolve(__dirname, 'src'),
  entry: {
    reddit: './content-scripts/reddit.ts',
    x: './content-scripts/x.ts',
    settings: './settings-page/script.ts',
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
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './settings-page/index.html',
      filename: 'settings.html',
      chunks: ['settings'],
    }),
  ],
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
};
