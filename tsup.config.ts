import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  external: ['react', 'react-dom'],
  dts: true,
  clean: true,
  sourcemap: true,
});
