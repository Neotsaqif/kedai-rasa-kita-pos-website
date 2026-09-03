import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Optional dev proxy. When VITE_API_BASE_URL is set to /api (instead of the
    // absolute http://localhost URL), Vite will forward requests to the PHP
    // backend served by XAMPP/Apache, avoiding CORS in development.
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            /^\/api/,
            '/kedai-rasa-kita-pos-website/backend/api/index.php',
          ),
      },
    },
  },
});
