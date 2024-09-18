// @ts-check
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                settings: resolve(__dirname, 'src/settings-page/index.html'),
                reddit: resolve(__dirname, 'src/content-scripts/reddit.ts'),
            },
            output: {
                entryFileNames: '[name].bundle.js', // Customize the output filename
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
        outDir: resolve(__dirname, 'dist'), // Set output directory
        emptyOutDir: true, // Equivalent to Webpack's 'clean: true'
    },

    // Vite supports .ts and .js files out of the box
    resolve: {
        extensions: ['.ts', '.js'],
    },

    // Environment variables (replaces DefinePlugin)
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },

    // Vite plugins (if you need any, like Vue, React, etc.)
    plugins: [{
        name: 'remove-src-dir-from-html-path',
        enforce: 'post',
        generateBundle(_,bundle) {
            const htmlFileInSrcFolderPattern = /^src\/.*\.html$/;
            for (const outputItem of Object.values(bundle)) {
                if (!htmlFileInSrcFolderPattern.test(outputItem.fileName)) {
                    continue;
                }
                outputItem.fileName = outputItem.fileName.replace('src/', '');
            }
        }
    }],
});
