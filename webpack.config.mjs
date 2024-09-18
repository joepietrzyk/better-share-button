// @ts-check
import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);  // Get the file path of the current module
const __dirname = path.dirname(__filename);

// noinspection JSUnusedGlobalSymbols
export default (argv, env) => {
    const mode = argv.mode || env.mode || 'production';
    
    return {
        entry: {
            'content-scripts/reddit': './src/content-scripts/reddit.ts', // Entry point for reddit.ts
            'settings-page/script': './src/settings-page/script.ts', // Script for the settings page
        },
        output: {
            filename: '[name].bundle.js',           // Output as reddit.bundle.js and x.bundle.js
            path: path.resolve(__dirname, 'dist'),  // Output directory is dist
            clean: true,
        },
        resolve: {
            extensions: ['.ts', '.js'],  // Resolve .ts and .js files
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,  // Apply this rule to TypeScript files
                    use: 'ts-loader', // Use ts-loader to transpile TypeScript to JavaScript
                    exclude: /node_modules/, // Exclude node_modules from being processed
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(mode)
            }),
            new HtmlWebpackPlugin({
                template: './src/settings-page/index.html',
                filename: 'settings-page/index.html',
                chunks: ['settings-page/script'],
            }),
        ],
        mode: mode,  // Can be 'development' or 'production'
    };
};
