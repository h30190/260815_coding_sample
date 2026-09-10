import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // ponytail: 埠號寫死 + strictPort，避免跟 Wails 或其他 Vite 專案打架（被佔用直接報錯不自動跳埠）
      port: 3000,
      strictPort: true,
      // ponytail: dev 經 /api、/uploads 打後端 :3001，正式部署改由後端 serve dist/
      proxy: {
        '/api': 'http://localhost:3001',
        '/uploads': 'http://localhost:3001',
      },
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
  };
});
