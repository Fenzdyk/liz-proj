import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const defaultContext = { title: 'Страница' };

function resolveHtmlDiskPath(pagePath, pagesRoot) {
  if (pagePath && existsSync(pagePath)) {
    return pagePath;
  }
  return join(pagesRoot, String(pagePath).replace(/^[/\\]+/, ''));
}

/**
 * vite-plugin-handlebars передаёт pagePath как публичный путь (ctx.path), напр. /index/index.html.
 * Такой путь на Unix выглядит как «абсолютный», но файла в корне ФС нет — тогда склеиваем с pagesRoot.
 */
export function createPageContextLoader(pagesRoot) {
  return async function loadPageContext(pagePath) {
    const htmlPath = resolveHtmlDiskPath(pagePath, pagesRoot);
    const dir = dirname(htmlPath);
    const ctxPath = join(dir, 'context.js');
    if (!existsSync(ctxPath)) {
      return { ...defaultContext };
    }
    const base = pathToFileURL(ctxPath).href;
    const url =
      process.env.NODE_ENV === 'production'
        ? base
        : `${base}?t=${Date.now()}`;
    const mod = await import(url);
    const data = mod.default;
    if (data == null) {
      return { ...defaultContext };
    }
    if (typeof data === 'function') {
      const out = await data(pagePath);
      return out && typeof out === 'object' ? out : { ...defaultContext };
    }
    return typeof data === 'object' ? data : { ...defaultContext };
  };
}
