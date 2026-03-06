import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'magic',
    dir: './src',
    watch: false,
    globals: true
  }
})
