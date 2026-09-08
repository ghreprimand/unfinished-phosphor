/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Unfinished Works
 */
import { defineConfig } from 'vite';
export default defineConfig({
  plugins: [{
    name: 'development-source-download',
    transformIndexHtml(html, context) {
      return context.server ? html.replaceAll('href="/source.tgz"', 'href="/dist/source.tgz"') : html;
    },
  }],
  build: { rollupOptions: { input: { playground: 'index.html', plain: 'examples/plain.html' } } },
});
