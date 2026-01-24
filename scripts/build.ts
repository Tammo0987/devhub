#!/usr/bin/env bun
import solidPlugin from "@opentui/solid/bun-plugin"
import { existsSync, mkdirSync } from "fs"

const outdir = "./dist"

// Ensure output directory exists
if (!existsSync(outdir)) {
  mkdirSync(outdir, { recursive: true })
}

// Determine platform
const platform = `${process.platform}-${process.arch}`

console.log(`Building for ${platform}...`)

const result = await Bun.build({
  entrypoints: ["./src/index.tsx"],
  target: "bun",
  outdir,
  plugins: [solidPlugin],
  minify: true,
})

if (!result.success) {
  console.error("Build failed:")
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

console.log("Build complete!")
console.log(`Output: ${outdir}/index.js`)

// Compile to standalone binary
console.log("\nCompiling to standalone binary...")

const proc = Bun.spawn(["bun", "build", "--compile", `${outdir}/index.js`, "--outfile", `${outdir}/devhub`], {
  stdout: "inherit",
  stderr: "inherit",
})

await proc.exited

if (proc.exitCode === 0) {
  console.log(`Binary created: ${outdir}/devhub`)
} else {
  console.error("Binary compilation failed")
  process.exit(1)
}
