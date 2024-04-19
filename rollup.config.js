const nodeResolve = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');

module.exports = [
  {
    input: './src/main/bin.ts',
    output: { format: 'cjs', entryFileNames: '[name].js', dir: './lib' },
    plugins: [nodeResolve(), typescript({ tsconfig: './tsconfig.build.json' })],
    external: /index/,
  },
  {
    input: './src/main/index.ts',
    output: [
      { format: 'cjs', entryFileNames: 'index.js', dir: './lib' },
      { format: 'es', entryFileNames: 'index.mjs', dir: './lib' },
    ],
    plugins: [nodeResolve(), typescript({ tsconfig: './tsconfig.build.json' })],
    external: ['child_process'],
  },
];
