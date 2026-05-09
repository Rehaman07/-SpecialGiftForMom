import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

const singleFileBuild = (): Plugin => ({
  name: 'single-file-build',
  apply: 'build',
  enforce: 'post',
  generateBundle(_, bundle) {
    const htmlAsset = Object.values(bundle).find(
      (asset) => asset.type === 'asset' && asset.fileName.endsWith('.html'),
    );

    if (!htmlAsset || htmlAsset.type !== 'asset' || typeof htmlAsset.source !== 'string') return;

    let html = htmlAsset.source;

    for (const [fileName, output] of Object.entries(bundle)) {
      if (output.type === 'chunk' && output.fileName.endsWith('.js')) {
        html = html.replace(
          new RegExp(`<script type="module" crossorigin src="/${output.fileName}"></script>`),
          () => `<script type="module">${output.code}</script>`,
        );
        html = html.replace(
          new RegExp(`<script type="module" src="/${output.fileName}"></script>`),
          () => `<script type="module">${output.code}</script>`,
        );
        delete bundle[fileName];
      }

      if (output.type === 'asset' && output.fileName.endsWith('.css')) {
        html = html.replace(
          new RegExp(`<link rel="stylesheet" crossorigin href="/${output.fileName}">`),
          () => `<style>${output.source}</style>`,
        );
        html = html.replace(
          new RegExp(`<link rel="stylesheet" href="/${output.fileName}">`),
          () => `<style>${output.source}</style>`,
        );
        delete bundle[fileName];
      }
    }

    htmlAsset.source = html;
  },
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), singleFileBuild()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify-file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      assetsInlineLimit: 4 * 1024 * 1024,
      cssCodeSplit: false,
    },
  };
});
