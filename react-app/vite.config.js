import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Single-page app. `vite preview` and `vite dev` serve index.html for unknown
// routes automatically, so deep links / refresh work in local testing. For
// production on a static server, see the SPA-fallback files in /public
// (_redirects, .htaccess) and react-app/README.md.
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
})
