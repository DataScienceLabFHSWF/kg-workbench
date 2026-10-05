import { setupServer } from "msw/node"

import { extractionHandlers } from "./handlers/extraction"

export const server = setupServer(...extractionHandlers)
