import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base は GitHub Pages のサブパス。CI では VITE_BASE を設定する(deploy.yml)。
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
});
