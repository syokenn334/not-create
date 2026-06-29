import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base は GitHub Pages のサブパス。CI では VITE_BASE を設定する(deploy.yml)。
// dedupe: @strudel/core 等を単一インスタンスに強制(Pattern の二重ロード=punchcard 不発を防ぐ)。
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  resolve: {
    dedupe: [
      '@strudel/core',
      '@strudel/webaudio',
      '@strudel/mini',
      '@strudel/tonal',
      '@strudel/transpiler',
      '@strudel/draw',
    ],
  },
});
