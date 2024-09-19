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
        entryFileNames: '[name].bundle.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true, // Equivalent to Webpack's 'clean: true'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
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
