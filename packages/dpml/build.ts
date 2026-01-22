/**
 * Bun Build Script for dpml
 * ESM-only modern build
 */

import { dts } from "bun-dts";

const pkg = await Bun.file("./package.json").json();
const outdir = "./dist";

await Bun.$`rm -rf ${outdir}`;

console.log(`Building dpml v${pkg.version}\n`);

const result = await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir,
  format: "esm",
  target: "node",
  sourcemap: "external",
  minify: false,
  plugins: [dts()],
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

console.log(`Build complete: ${result.outputs.length} files`);
