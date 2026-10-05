const MODULE_COLOR_VARS = [
  "var(--graph-module-1)",
  "var(--graph-module-2)",
  "var(--graph-module-3)",
  "var(--graph-module-4)",
  "var(--graph-module-5)",
  "var(--graph-module-6)",
  "var(--graph-module-7)",
  "var(--graph-module-8)",
] as const

const CLASS_HUE_RANGE = 360
const CLASS_HUE_STEP = 137

export function resolveModuleColor(index: number): string {
  if (index < 0) return "var(--graph-module-none)"
  return MODULE_COLOR_VARS[index % MODULE_COLOR_VARS.length]
}

export function getGraphUnmappedColorValue(): string {
  return "var(--graph-module-unmapped)"
}

export function buildGraphClassColor(
  classId: string,
  usedHues: Set<number>
): string {
  let hue = hashString(classId) % CLASS_HUE_RANGE
  let attempts = 0

  while (usedHues.has(hue) && attempts < CLASS_HUE_RANGE) {
    hue = (hue + CLASS_HUE_STEP) % CLASS_HUE_RANGE
    attempts += 1
  }

  usedHues.add(hue)

  return `oklch(var(--graph-class-lightness) var(--graph-class-chroma) ${hue})`
}

function hashString(value: string): number {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash
}
