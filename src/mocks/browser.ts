import { setupWorker } from "msw/browser"

import { extractionHandlers } from "./handlers/extraction"

export const worker = setupWorker(...extractionHandlers)
