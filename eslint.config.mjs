import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/features/documents/components/fact-inspector/facts-tab/facts-tab.tsx",
      "src/features/documents/components/fact-table/fact-table.tsx",
      "src/features/documents/components/upload-document-dialog/use-upload-document.ts",
      "src/features/ontology/components/dialogs/create-class-dialog.tsx",
      "src/features/ontology/components/shared/editable-field.tsx",
      "src/features/ontology/flow/ontology-canvas/ontology-canvas.tsx",
      "src/hooks/use-mobile.ts",
    ],
    rules: {
      // Several interactive views intentionally synchronize local UI state with
      // query results and controlled props. Next 16.3 enables this advisory as
      // an error, but replacing these effects would change their reset behavior.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".cache/**",
    "tmp/**",
    "**/.venv/**",
    "**/__pycache__/**",
    ".pytest_cache/**",
    "**/.pytest_cache/**",
  ]),
])

export default eslintConfig
