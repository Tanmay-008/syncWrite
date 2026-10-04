import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],

    format: ['esm'],

    target: 'node22',

    clean: true,

    minify: true,
    splitting: false,

    sourcemap: true,

    shims: true,
});