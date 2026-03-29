import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import handlebars from 'vite-plugin-handlebars';
import { createPageContextLoader } from './vite/page-context.js';
import { homePageRedirectPlugin } from './vite/home-redirect-plugin.js';
import { flattenMpaDistPlugin } from './vite/flatten-mpa-dist-plugin.js';
import { MPA_PAGES } from './vite/mpa-config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pagesRoot = resolve(__dirname, 'src/pages');
const distDir = resolve(__dirname, 'dist');
const loadPageContext = createPageContextLoader(pagesRoot);

const rollupInput = Object.fromEntries(
  MPA_PAGES.map(({ rollupKey, folder }) => [
    rollupKey,
    resolve(pagesRoot, folder, 'index.html'),
  ]),
);

export default {
  root: pagesRoot,
  publicDir: resolve(__dirname, 'public'),
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
  plugins: [
    homePageRedirectPlugin(),
    flattenMpaDistPlugin(distDir),
    handlebars({
      partialDirectory: resolve(__dirname, 'partials'),
      context(pagePath) {
        return loadPageContext(pagePath);
      },
    }),
  ],
  build: {
    outDir: distDir,
    emptyOutDir: true,
    rollupOptions: {
      input: rollupInput,
    },
  },
};
