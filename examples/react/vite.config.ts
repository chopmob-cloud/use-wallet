import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  resolve: {
    dedupe: [
      '@web3auth/modal',
      '@web3auth/base',
      '@web3auth/base-provider',
      '@web3auth/single-factor-auth'
    ],
    alias: {
      // Magic SDK's ESM build has a broken re-export — use CJS entry instead
      '@magic-sdk/provider': path.resolve(
        __dirname,
        'node_modules/@magic-sdk/provider/dist/cjs/index.js'
      )
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
