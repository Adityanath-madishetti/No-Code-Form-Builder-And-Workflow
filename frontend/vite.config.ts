// frontend/vite.config.ts
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

const fluxorisRemoteUrl =
  process.env.VITE_FLUXORIS_REMOTE_URL ||
  'http://localhost:5174/assets/remoteEntry.js';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'submission_provider',
      filename: 'remoteEntry.js',
      exposes: {
        './SubmissionView':
          './src/modules/submissions/microFrontends/submission-viewer/SubmissionViewModule.tsx',
      },
      // shared: ['react', 'react-dom'],
      remotes: {
        fluxorisPartnerMfe: fluxorisRemoteUrl,
      },
      shared: {
        react: {
          requiredVersion: false,
        },
        'react-dom': {
          requiredVersion: false,
        },
        'react/jsx-runtime': {
          requiredVersion: false,
        },
        'react/jsx-dev-runtime': {
          requiredVersion: false,
        },
      },
    }),
  ],
  server: {
    port: 5173,
    cors: true,
    // allowedHosts: [
    //   'lip-backstage-legal.ngrok-free.dev'
    // ]
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_PROXY_TARGET || 'http://backend:5001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    cors: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
