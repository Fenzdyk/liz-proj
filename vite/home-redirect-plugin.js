import { MPA_FOLDERS } from './mpa-config.js';

function rewriteDevUrl(rawUrl) {
  if (rawUrl == null) {
    return rawUrl;
  }
  const [pathPart, query = ''] = rawUrl.split('?');
  const suffix = query ? `?${query}` : '';

  if (pathPart === '/' || pathPart === '/index.html') {
    return `/index/index.html${suffix}`;
  }

  for (const folder of MPA_FOLDERS) {
    const nested = `/${folder}/index.html`;
    if (pathPart === `/${folder}` || pathPart === `/${folder}/`) {
      return `${nested}${suffix}`;
    }
    if (folder !== 'index') {
      const flat = `/${folder}.html`;
      if (pathPart === flat) {
        return `${nested}${suffix}`;
      }
    }
  }

  return rawUrl;
}

/** После flatten в dist лежат /index.html, /studio.html, … */
function rewritePreviewUrl(rawUrl) {
  if (rawUrl == null) {
    return rawUrl;
  }
  const [pathPart, query = ''] = rawUrl.split('?');
  const suffix = query ? `?${query}` : '';

  if (pathPart === '/index.html') {
    return rawUrl;
  }
  if (pathPart === '/' || pathPart === '/index' || pathPart === '/index/') {
    return `/index.html${suffix}`;
  }
  if (pathPart === '/index/index.html') {
    return `/index.html${suffix}`;
  }

  for (const folder of MPA_FOLDERS) {
    if (folder === 'index') {
      continue;
    }
    const flat = `/${folder}.html`;
    if (
      pathPart === `/${folder}` ||
      pathPart === `/${folder}/` ||
      pathPart === `/${folder}/index.html`
    ) {
      return `${flat}${suffix}`;
    }
  }

  return rawUrl;
}

/**
 * Dev: исходники в {folder}/index.html, ссылки в шаблонах — *.html в корне (как на проде).
 * Preview: та же схема URL, файлы уже плоские в dist.
 */
export function homePageRedirectPlugin() {
  return {
    name: 'home-page-redirect',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        req.url = rewriteDevUrl(req.url);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        req.url = rewritePreviewUrl(req.url);
        next();
      });
    },
  };
}
