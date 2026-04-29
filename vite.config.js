import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HTML_ENTRIES = [
  'index.html',
  'about.html',
  'admin.html',
  'browse-requests.html',
  'login.html',
  'my-offers.html',
  'my-requests.html',
  'post-request.html',
  'register.html',
];

function buildHtmlInput() {
  return HTML_ENTRIES.reduce((acc, fileName) => {
    acc[path.parse(fileName).name] = path.resolve(__dirname, fileName);
    return acc;
  }, {});
}

function copyLegacyMainScript() {
  return {
    name: 'copy-legacy-main-script',
    closeBundle() {
      const sourcePath = path.resolve(__dirname, 'main.js');
      const outputPath = path.resolve(__dirname, 'dist', 'main.js');
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, outputPath);
      }
    },
  };
}

export default defineConfig({
  base: '/sdelka/',//sdelka
  plugins: [react(), copyLegacyMainScript()],
  build: {
    rollupOptions: {
      input: buildHtmlInput(),
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Feature chunks
          if (id.includes('/src/pages/Admin')) {
            return 'chunk-admin';
          }
          if (id.includes('/src/pages/') && (id.includes('Request') || id.includes('Offer'))) {
            return 'chunk-requests';
          }
          if (id.includes('/src/data/')) {
            return 'chunk-data';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});

