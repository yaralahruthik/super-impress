/**
 * Transforms the OpenAPI spec from the backend to be compatible with Orval.
 *
 * Issues fixed:
 * 1. Converts inline requestBody schemas to $ref references
 * 2. Fixes type arrays like ["string", "null"] to use nullable: true (OpenAPI 3.0 style)
 * 3. Fixes parameter schemas with type arrays
 */

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface OpenAPISpec {
	openapi: string;
	info: Record<string, unknown>;
	components: {
		schemas: Record<string, unknown>;
		securitySchemes?: Record<string, unknown>;
	};
	paths: Record<string, Record<string, OperationObject>>;
}

interface ParameterObject {
	name: string;
	in: string;
	schema?: Record<string, unknown>;
	required?: boolean;
	[key: string]: unknown;
}

interface OperationObject {
	operationId?: string;
	parameters?: ParameterObject[];
	requestBody?: {
		required?: boolean;
		content?: {
			'application/json'?: {
				schema: Record<string, unknown>;
			};
		};
	};
	[key: string]: unknown;
}

function capitalizeFirst(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateSchemaName(operationId: string | undefined, path: string, method: string): string {
	if (operationId) {
		return `${capitalizeFirst(operationId)}Request`;
	}
	// Fallback: generate from path
	const pathParts = path.split('/').filter(Boolean).map(capitalizeFirst).join('');
	return `${pathParts}${capitalizeFirst(method)}Request`;
}

function fixNullableTypes(schema: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(schema)) {
		if (key === 'type' && Array.isArray(value)) {
			// Convert ["string", "null"] to type: "string", nullable: true
			const types = value.filter((t) => t !== 'null');
			if (types.length === 1) {
				result['type'] = types[0];
				if (value.includes('null')) {
					result['nullable'] = true;
				}
			} else if (types.length > 1) {
				// Multiple non-null types - just use the first one
				result['type'] = types[0];
				if (value.includes('null')) {
					result['nullable'] = true;
				}
			} else {
				result[key] = value;
			}
		} else if (value && typeof value === 'object' && !Array.isArray(value)) {
			result[key] = fixNullableTypes(value as Record<string, unknown>);
		} else if (Array.isArray(value)) {
			result[key] = value.map((item) =>
				item && typeof item === 'object' ? fixNullableTypes(item as Record<string, unknown>) : item
			);
		} else {
			result[key] = value;
		}
	}

	return result;
}

async function transformOpenAPI(): Promise<void> {
	const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
	const response = await fetch(`${BACKEND_URL}/openapi/json`);

	if (!response.ok) {
		throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
	}

	const spec = (await response.json()) as OpenAPISpec;

	// Ensure components.schemas exists
	if (!spec.components) {
		spec.components = { schemas: {} };
	}
	if (!spec.components.schemas) {
		spec.components.schemas = {};
	}

	// Process each path and extract inline requestBody schemas
	for (const [path, methods] of Object.entries(spec.paths)) {
		for (const [method, operation] of Object.entries(methods)) {
			if (method === 'parameters') continue; // Skip path-level parameters

			const op = operation as OperationObject;

			// Fix parameters with type arrays
			if (op.parameters) {
				for (const param of op.parameters) {
					if (param.schema) {
						param.schema = fixNullableTypes(param.schema);
					}
				}
			}

			// Fix requestBody schemas
			if (op.requestBody?.content?.['application/json']?.schema) {
				const inlineSchema = op.requestBody.content['application/json'].schema;

				// Skip if already a $ref
				if ('$ref' in inlineSchema) continue;

				// Generate a schema name and add to components
				const schemaName = generateSchemaName(op.operationId, path, method);

				// Fix nullable types in the schema before adding
				const fixedSchema = fixNullableTypes(inlineSchema);
				spec.components.schemas[schemaName] = fixedSchema;

				// Replace inline schema with $ref
				op.requestBody.content['application/json'].schema = {
					$ref: `#/components/schemas/${schemaName}`
				};
			}
		}
	}

	// Also fix nullable types in existing component schemas
	for (const [name, schema] of Object.entries(spec.components.schemas)) {
		if (schema && typeof schema === 'object') {
			spec.components.schemas[name] = fixNullableTypes(schema as Record<string, unknown>);
		}
	}

	// Write the transformed spec to the frontend directory
	const outputPath = resolve(__dirname, '../openapi.json');
	writeFileSync(outputPath, JSON.stringify(spec, null, 2));

	console.log(`✅ Transformed OpenAPI spec written to ${outputPath}`);
}

transformOpenAPI().catch((error) => {
	console.error('❌ Failed to transform OpenAPI spec:', error);
	process.exit(1);
});
