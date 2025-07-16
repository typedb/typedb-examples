import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    open: true
  },
  optimizeDeps: {
    include: ['typedb-driver-http/**/*.js']
  },
}); 
