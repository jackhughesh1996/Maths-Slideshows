import {fileURLToPath} from 'url';
import path from 'path';
import {defineConfig} from 'vite';
import {lessonManifest} from './src/lessons/manifest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  const lessonEntryPaths = lessonManifest.map((lesson) =>
    path.resolve(__dirname, 'lessons', lesson.id, 'index.html')
  );

  return {
    base: './',
    input: [
      path.resolve(__dirname, 'index.html'),
      ...lessonEntryPaths,
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
