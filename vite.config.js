import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { createPageContextLoader } from './vite/page-context.js';
import { homePageRedirectPlugin } from './vite/home-redirect-plugin.js';
import { flattenMpaDistPlugin } from './vite/flatten-mpa-dist-plugin.js';
import { MPA_PAGES } from './vite/mpa-config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pagesRoot = resolve(__dirname, 'src/pages');
const distDir = resolve(__dirname, 'dist');

/** GitHub Pages (project site): /repo-name/ — задаётся в CI через VITE_BASE_URL */
function viteBaseFromEnv() {
  const raw = process.env.VITE_BASE_URL;
  if (raw == null || raw === '' || raw === '/') {
    return '/';
  }
  const trimmed = String(raw).replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

export default defineConfig(() => {
  const base = viteBaseFromEnv();
  const loadPageContext = createPageContextLoader(pagesRoot);

  const rollupInput = Object.fromEntries(
    MPA_PAGES.map(({ rollupKey, folder }) => [
      rollupKey,
      resolve(pagesRoot, folder, 'index.html'),
    ]),
  );

  return {
    base,
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
        async context(pagePath) {
          const data = await loadPageContext(pagePath);
          return { ...data, siteBase: base };
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
});
