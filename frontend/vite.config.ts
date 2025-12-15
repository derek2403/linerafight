import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
      include: ['crypto', 'buffer', 'stream', 'util', 'vm', 'http', 'https'],
      globals: {
        Buffer: true,
        global: false,
        process: false,
      },
    }),
  ],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        linera: '@linera/client',
      },
      preserveEntrySignatures: 'strict',
    },
  },
  resolve: {
    alias: {
      '@linera/metamask': path.resolve(__dirname, 'metamask/src/index.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['@linera/client'],
  },
  server: {
    headers: {
      // Use 'credentialless' for SharedArrayBuffer support (required by Linera WASM)
      // Dynamic Labs iframe should still work with this setting
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
    fs: {
      allow: ['..'],
    },
    proxy: {
      '/rpc/pops': {
        target: 'https://linera.pops.one',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc\/pops/, ''),
        secure: false,
      },
      '/rpc/sslip': {
        target: 'https://15.204.31.226.sslip.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc\/sslip/, ''),
        secure: false,
      },
      '/rpc/sensei': {
        target: 'https://linera-testnet.senseinode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc\/sensei/, ''),
        secure: false,
      },
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  },
})
