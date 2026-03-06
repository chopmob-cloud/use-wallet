import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const require = createRequire(import.meta.url)

// Resolve @magic-sdk/provider's CJS entry to work around broken ESM build.
// require.resolve() returns the CJS entry via the package's "require" export,
// which is the same file we need as the alias target.
const magicProviderCjs = require.resolve('@magic-sdk/provider')

export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  resolve: {
    alias: {
      // Magic SDK's ESM build has a broken re-export — use CJS entry instead
      // @see https://github.com/magiclabs/magic-js/issues/805
      '@magic-sdk/provider': magicProviderCjs
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
