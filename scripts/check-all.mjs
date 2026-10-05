import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { basename, join } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = fileURLToPath(new URL("../", import.meta.url))
const gitleaksVersion = "8.30.1"
const gitleaksArtifacts = {
  "darwin-arm64": {
    file: `gitleaks_${gitleaksVersion}_darwin_arm64.tar.gz`,
    sha256: "b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5",
  },
  "darwin-x64": {
    file: `gitleaks_${gitleaksVersion}_darwin_x64.tar.gz`,
    sha256: "dfe101a4db2255fc85120ac7f3d25e4342c3c20cf749f2c20a18081af1952709",
  },
  "linux-arm64": {
    file: `gitleaks_${gitleaksVersion}_linux_arm64.tar.gz`,
    sha256: "e4a487ee7ccd7d3a7f7ec08657610aa3606637dab924210b3aee62570fb4b080",
  },
  "linux-ia32": {
    file: `gitleaks_${gitleaksVersion}_linux_x32.tar.gz`,
    sha256: "a87ba11adab22b4d6c6ea28b2da60f09154d5c2fdb44d4b07015d1e0433daecb",
  },
  "linux-x64": {
    file: `gitleaks_${gitleaksVersion}_linux_x64.tar.gz`,
    sha256: "551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb",
  },
  "win32-arm64": {
    file: `gitleaks_${gitleaksVersion}_windows_arm64.zip`,
    sha256: "b95f5e4f5c425cedca7ee203d9afd29597e692c4924a12ed42f970537c72cc0f",
  },
  "win32-ia32": {
    file: `gitleaks_${gitleaksVersion}_windows_x32.zip`,
    sha256: "190ad53db301eec3e90afe3a1a75270768b8ebf89e731345e19421c32c1ae1a1",
  },
  "win32-x64": {
    file: `gitleaks_${gitleaksVersion}_windows_x64.zip`,
    sha256: "d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e",
  },
}
const requestedOptions = new Set(process.argv.slice(2))
const supportedOptions = new Set(["--database"])
const unknownOptions = [...requestedOptions].filter(
  (option) => !supportedOptions.has(option)
)

if (unknownOptions.length > 0) {
  throw new Error(`Unknown option(s): ${unknownOptions.join(", ")}`)
}

const runner = process.env.npm_execpath
if (!runner) {
  throw new Error("Run this script with npm run check:all or pnpm check:all.")
}

const { packageManager } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
)
const environment = {
  ...process.env,
  HUSKY: "0",
  NEXT_TELEMETRY_DISABLED: "1",
}

function failure(message, exitCode = 1) {
  const error = new Error(message)
  error.exitCode = exitCode
  return error
}

function run(
  label,
  command,
  args,
  { allowFailure = false, stdout = "inherit" } = {}
) {
  console.log(`\n==> ${label}`)

  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: environment,
    stdio: ["inherit", stdout, "inherit"],
  })
  const exitCode = result.status ?? 1

  if (result.error) {
    const message = `Could not run ${command}: ${result.error.message}`
    if (allowFailure) {
      console.error(message)
      return exitCode
    }
    throw failure(message, exitCode)
  }

  if (exitCode !== 0 && !allowFailure) {
    throw failure(`${label} failed with exit code ${exitCode}.`, exitCode)
  }

  return exitCode
}

function runPnpm(label, args, options) {
  const pnpmArgs = /^pnpm\.(?:c?js|mjs)$/.test(basename(runner))
    ? args
    : ["exec", "--yes", `--package=${packageManager}`, "--", "pnpm", ...args]

  return run(label, process.execPath, [runner, ...pnpmArgs], options)
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex")
}

async function prepareGitleaks() {
  const platformKey = `${process.platform}-${process.arch}`
  const artifact = gitleaksArtifacts[platformKey]
  if (!artifact) {
    throw new Error(
      `Automatic Gitleaks setup does not support ${platformKey}. Set GITLEAKS_BIN to a compatible executable.`
    )
  }

  const cacheDirectory = join(
    projectRoot,
    ".cache",
    "gitleaks",
    gitleaksVersion,
    platformKey
  )
  const archive = join(cacheDirectory, artifact.file)
  const executable = join(
    cacheDirectory,
    process.platform === "win32" ? "gitleaks.exe" : "gitleaks"
  )

  if (existsSync(executable)) return executable

  mkdirSync(cacheDirectory, { recursive: true })

  if (existsSync(archive) && sha256(archive) !== artifact.sha256) {
    rmSync(archive, { force: true })
  }

  if (!existsSync(archive)) {
    const download = `${archive}.download`
    const url = `https://github.com/gitleaks/gitleaks/releases/download/v${gitleaksVersion}/${artifact.file}`

    console.log(`\n==> Download Gitleaks ${gitleaksVersion}`)
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Download failed with HTTP ${response.status}.`)
      }
      writeFileSync(download, Buffer.from(await response.arrayBuffer()))
      if (sha256(download) !== artifact.sha256) {
        throw new Error("Downloaded Gitleaks archive has an invalid checksum.")
      }
      renameSync(download, archive)
    } catch (error) {
      rmSync(download, { force: true })
      throw error
    }
  }

  run("Extract Gitleaks", "tar", ["-xf", archive, "-C", cacheDirectory])
  if (!existsSync(executable)) {
    throw new Error(
      "The Gitleaks archive did not contain the expected executable."
    )
  }
  if (process.platform !== "win32") chmodSync(executable, 0o755)

  return executable
}

const temporaryDirectory = mkdtempSync(join(tmpdir(), "kg-workbench-check-"))
const requirementsFile = join(temporaryDirectory, "extractor-requirements.txt")
const gitleaks = process.env.GITLEAKS_BIN ?? (await prepareGitleaks())
let exitCode = 0

try {
  runPnpm("Install the locked JavaScript dependencies", [
    "install",
    "--frozen-lockfile",
  ])
  runPnpm("Lint, typecheck, test, and build the web app", ["check"])
  runPnpm("Audit JavaScript dependencies", [
    "audit",
    "--audit-level=high",
    "--ignore",
    "GHSA-vfj7-8cjw-p6xm",
  ])

  run("Sync the locked Python environment", "uv", [
    "sync",
    "--project",
    "services/internal-extractor",
    "--locked",
  ])
  run("Test the Python extractor", "uv", [
    "run",
    "--directory",
    "services/internal-extractor",
    "--locked",
    "pytest",
  ])
  run(
    "Export locked Python dependencies",
    "uv",
    [
      "export",
      "--project",
      "services/internal-extractor",
      "--locked",
      "--no-emit-project",
      "--format",
      "requirements-txt",
      "--output-file",
      requirementsFile,
    ],
    { stdout: "ignore" }
  )
  run("Audit Python dependencies", "uvx", [
    "pip-audit",
    "--require-hashes",
    "--no-deps",
    "--ignore-vuln",
    "PYSEC-2026-3740",
    "-r",
    requirementsFile,
  ])

  run("Scan Git history for secrets", gitleaks, [
    "git",
    ".",
    "--redact",
    "--log-opts=--all",
  ])

  if (requestedOptions.has("--database")) {
    let databaseFailure

    try {
      runPnpm("Start the disposable Supabase database", [
        "exec",
        "supabase",
        "start",
      ])
      runPnpm("Apply migrations and seed the disposable database", [
        "db:reset-local",
      ])
    } catch (error) {
      databaseFailure = error
    } finally {
      const stopExitCode = runPnpm(
        "Stop the disposable Supabase database",
        ["exec", "supabase", "stop", "--no-backup"],
        { allowFailure: true }
      )
      if (!databaseFailure && stopExitCode !== 0) {
        databaseFailure = failure(
          `Stopping Supabase failed with exit code ${stopExitCode}.`,
          stopExitCode
        )
      }
    }

    if (databaseFailure) throw databaseFailure
  } else {
    console.log(
      "\nDatabase reset skipped. Use `pnpm check:all -- --database` with a disposable local Supabase instance."
    )
  }

  console.log("\nAll requested checks passed.")
} catch (error) {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`)
  exitCode = error?.exitCode ?? 1
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true })
}

process.exit(exitCode)
