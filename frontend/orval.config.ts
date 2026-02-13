import { defineConfig } from "orval";

export default defineConfig({
  "super-impress": {
    input: "./openapi.json",
    output: {
      httpClient: "axios",
      target: "./src/api/superimpress.ts",
      mode: "tags-split",
      client: "react-query",
      override: {
        mutator: {
          path: "src/api/axios.ts",
          name: "customInstance",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: {
        command: "bun fix",
        injectGeneratedDirsAndFiles: false,
      },
    },
  },
  "super-impress-zod": {
    input: "./openapi.json",
    output: {
      target: "./src/api",
      mode: "tags-split",
      client: "zod",
      fileExtension: ".zod.ts",
    },
    hooks: {
      afterAllFilesWrite: {
        command: "bun fix",
        injectGeneratedDirsAndFiles: false,
      },
    },
  },
});
