import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // Ensures relative paths in Electron/file://
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    headers: {
      'Service-Worker-Allowed': '/'
    }
  }
})
