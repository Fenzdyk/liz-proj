/**
 * MPA: одна запись = вход Rollup и папка под src/pages/{folder}/index.html.
 * После сборки плагин flatten выкладывает HTML в корень dist (*.html).
 */
export const MPA_PAGES = [
  { rollupKey: 'main', folder: 'index' },
  { rollupKey: 'studio', folder: 'studio' },
  { rollupKey: 'masterClasses', folder: 'master-classes' },
  { rollupKey: 'subscriptions', folder: 'subscriptions' },
  { rollupKey: 'holidays', folder: 'holidays' },
  { rollupKey: 'contacts', folder: 'contacts' },
];

export const MPA_FOLDERS = MPA_PAGES.map((p) => p.folder);
