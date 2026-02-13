import { defineConfig } from "orval";

const JSON_CONTENT_TYPE = "application/json";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function getJsonOnlyContent(
  content: Record<string, unknown>
): Record<string, unknown> | null {
  const jsonContent = content[JSON_CONTENT_TYPE];

  if (!jsonContent) {
    return null;
  }

  return {
    [JSON_CONTENT_TYPE]: jsonContent,
  };
}

function normalizeOperationRequestBody(operation: unknown): void {
  const operationRecord = asRecord(operation);

  if (!operationRecord) {
    return;
  }

  const requestBody = asRecord(operationRecord.requestBody);

  if (!requestBody || "$ref" in requestBody) {
    return;
  }

  const content = asRecord(requestBody.content);

  if (!content) {
    return;
  }

  const jsonOnlyContent = getJsonOnlyContent(content);

  if (!jsonOnlyContent) {
    return;
  }

  requestBody.content = jsonOnlyContent;
}

function keepOnlyJsonRequestBodies(spec: Record<string, unknown>) {
  const transformed = structuredClone(spec) as Record<string, unknown>;
  const paths = asRecord(transformed.paths);

  if (!paths) {
    return transformed;
  }

  for (const pathItem of Object.values(paths)) {
    const pathItemRecord = asRecord(pathItem);

    if (!pathItemRecord) {
      continue;
    }

    for (const [method, operation] of Object.entries(pathItemRecord)) {
      if (method === "parameters") {
        continue;
      }

      normalizeOperationRequestBody(operation);
    }
  }

  return transformed;
}

export default defineConfig({
  "super-impress": {
    input: {
      target: "./openapi.json",
      override: {
        transformer: keepOnlyJsonRequestBodies,
      },
    },
    output: {
      httpClient: "axios",
      target: "./src/api/superimpress.ts",
      mode: "tags-split",
      client: "react-query",
      override: {
        contentType: {
          include: ["application/json"],
        },
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
    input: {
      target: "./openapi.json",
      override: {
        transformer: keepOnlyJsonRequestBodies,
      },
    },
    output: {
      target: "./src/api",
      mode: "tags-split",
      client: "zod",
      fileExtension: ".zod.ts",
      override: {
        contentType: {
          include: ["application/json"],
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
});
