import fs from 'node:fs';
import path from 'node:path';
import { MPA_PAGES } from './mpa-config.js';

/**
 * После build: dist/{folder}/index.html → dist/{folder}.html (главная → dist/index.html),
 * пустые папки страниц удаляются — на статике работают обычные файлы без rewrite на сервере.
 */
export function flattenMpaDistPlugin(outDir) {
  return {
    name: 'flatten-mpa-dist',
    enforce: 'post',
    closeBundle() {
      const dist = path.resolve(outDir);
      for (const { folder } of MPA_PAGES) {
        const nested = path.join(dist, folder, 'index.html');
        const flatName = folder === 'index' ? 'index.html' : `${folder}.html`;
        const flatPath = path.join(dist, flatName);
        if (!fs.existsSync(nested)) {
          continue;
        }
        fs.renameSync(nested, flatPath);
        fs.rmSync(path.join(dist, folder), { recursive: true, force: true });
      }
    },
  };
}
