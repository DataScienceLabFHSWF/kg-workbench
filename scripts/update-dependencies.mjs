import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { basename } from "node:path"

const runner = process.env.npm_execpath
if (!runner) {
  throw new Error("Run this script with npm run deps:update or pnpm deps:update.")
}

const { packageManager } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
)
const updateArgs = ["update", "--latest", ...process.argv.slice(2)]
const args = /^pnpm\.(?:c?js|mjs)$/.test(basename(runner))
  ? updateArgs
  : ["exec", "--yes", `--package=${packageManager}`, "--", "pnpm", ...updateArgs]

// Argument arrays preserve flags on Windows and npm supplies pnpm when it is not on PATH.
const result = spawnSync(process.execPath, [runner, ...args], {
  stdio: "inherit",
})
if (result.error) throw result.error
process.exit(result.status ?? 1)
