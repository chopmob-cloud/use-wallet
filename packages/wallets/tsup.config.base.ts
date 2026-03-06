import { defineConfig, type Options } from 'tsup'

export const baseConfig: Options = {
  entry: ['src/index.ts'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['esm', 'cjs']
}

export default defineConfig(baseConfig)
