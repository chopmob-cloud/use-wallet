import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/adapter.ts', 'src/testing.ts'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['esm', 'cjs']
})
