/**
 * Pre-processes OpenAPI spec from backend before Orval generation.
 * Downloads the spec, applies transformations, and saves to openapi.json.
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface OpenAPIObject {
	openapi: string;
	info: Record<string, unknown>;
	components?: {
		schemas?: Record<string, unknown>;
		securitySchemes?: Record<string, unknown>;
		[key: string]: unknown;
	};
	paths: Record<string, Record<string, OperationObject>>;
	[key: string]: unknown;
}

interface ParameterObject {
	name: string;
	in: string;
	schema?: Record<string, unknown>;
	required?: boolean;
	[key: string]: unknown;
}

interface ResponseObject {
	description?: string;
	content?: {
		'application/json'?: {
			schema: Record<string, unknown>;
		};
		[key: string]: unknown;
	};
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
			[key: string]: unknown;
		};
		[key: string]: unknown;
	};
	responses?: Record<string, ResponseObject>;
	[key: string]: unknown;
}

function capitalizeFirst(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateSchemaName(
	operationId: string | undefined,
	path: string,
	method: string,
	type: 'request' | 'response',
	statusCode?: string
): string {
	if (operationId) {
		const suffix = type === 'request' ? 'Request' : `Response${statusCode || ''}`;
		return `${capitalizeFirst(operationId)}${suffix}`;
	}
	// Fallback: generate from path
	const pathParts = path.split('/').filter(Boolean).map(capitalizeFirst).join('');
	const suffix = type === 'request' ? 'Request' : `Response${statusCode || ''}`;
	return `${pathParts}${capitalizeFirst(method)}${suffix}`;
}

function deduplicateSchemaName(baseName: string, existingSchemas: Set<string>): string {
	if (!existingSchemas.has(baseName)) {
		return baseName;
	}

	let counter = 2;
	while (existingSchemas.has(`${baseName}${counter}`)) {
		counter++;
	}
	return `${baseName}${counter}`;
}

function removeIdFields(obj: unknown): unknown {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map(removeIdFields);
	}

	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		// Remove $id fields
		if (key === '$id') {
			continue;
		}
		result[key] = removeIdFields(value);
	}

	return result;
}

function fixNullableTypes(schema: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(schema)) {
		// Handle anyOf with null type
		if (key === 'anyOf' && Array.isArray(value)) {
			const hasNull = value.some(
				(item) => item && typeof item === 'object' && item.type === 'null'
			);
			const nonNullTypes = value.filter(
				(item) => !(item && typeof item === 'object' && item.type === 'null')
			);

			if (hasNull && nonNullTypes.length === 1 && typeof nonNullTypes[0] === 'object') {
				// Convert anyOf: [{type: "string"}, {type: "null"}] to type: "string", nullable: true
				const baseType = nonNullTypes[0] as Record<string, unknown>;
				Object.assign(result, fixNullableTypes(baseType));
				result['nullable'] = true;
				continue;
			}
		}

		// Handle type arrays like ["string", "null"]
		if (key === 'type' && Array.isArray(value)) {
			const types = value.filter((t) => t !== 'null');
			if (types.length === 1) {
				result['type'] = types[0];
				if (value.includes('null')) {
					result['nullable'] = true;
				}
			} else if (types.length > 1) {
				// Multiple non-null types - use anyOf
				result['anyOf'] = types.map((t) => ({ type: t }));
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
				item && typeof item === 'object' && !Array.isArray(item)
					? fixNullableTypes(item as Record<string, unknown>)
					: item
			);
		} else {
			result[key] = value;
		}
	}

	return result;
}

function transformOpenAPISpec(spec: OpenAPIObject): OpenAPIObject {
	console.log('🔄 Transforming OpenAPI spec...');
	console.log('📊 Input spec has', Object.keys(spec.paths || {}).length, 'paths');

	// Deep clone to avoid mutations
	const transformed = JSON.parse(JSON.stringify(spec)) as OpenAPIObject;

	// Ensure components.schemas exists
	if (!transformed.components) {
		transformed.components = { schemas: {} };
	}
	if (!transformed.components.schemas) {
		transformed.components.schemas = {};
	}

	// Track schema names to avoid collisions
	const existingSchemas = new Set<string>(Object.keys(transformed.components.schemas));

	let transformedCount = 0;

	// Process each path and extract inline schemas
	for (const [path, methods] of Object.entries(transformed.paths)) {
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
				if (!('$ref' in inlineSchema)) {
					// Generate a schema name and add to components
					const baseName = generateSchemaName(op.operationId, path, method, 'request');
					const schemaName = deduplicateSchemaName(baseName, existingSchemas);
					existingSchemas.add(schemaName);

					// Fix nullable types and remove $id fields
					let fixedSchema = fixNullableTypes(inlineSchema);
					fixedSchema = removeIdFields(fixedSchema) as Record<string, unknown>;

					transformed.components.schemas![schemaName] = fixedSchema;

					// Replace inline schema with $ref
					op.requestBody.content['application/json'].schema = {
						$ref: `#/components/schemas/${schemaName}`
					};

					transformedCount++;
				}
			}

			// Fix response schemas
			if (op.responses) {
				for (const [statusCode, response] of Object.entries(op.responses)) {
					const resp = response as ResponseObject;
					if (resp.content?.['application/json']?.schema) {
						const inlineSchema = resp.content['application/json'].schema;

						// Skip if already a $ref
						if (!('$ref' in inlineSchema)) {
							// Generate a schema name and add to components
							const baseName = generateSchemaName(
								op.operationId,
								path,
								method,
								'response',
								statusCode
							);
							const schemaName = deduplicateSchemaName(baseName, existingSchemas);
							existingSchemas.add(schemaName);

							// Fix nullable types and remove $id fields
							let fixedSchema = fixNullableTypes(inlineSchema);
							fixedSchema = removeIdFields(fixedSchema) as Record<string, unknown>;

							transformed.components.schemas![schemaName] = fixedSchema;

							// Replace inline schema with $ref
							resp.content['application/json'].schema = {
								$ref: `#/components/schemas/${schemaName}`
							};

							transformedCount++;
						}
					}
				}
			}
		}
	}

	// Fix nullable types and remove $id in existing component schemas
	for (const [name, schema] of Object.entries(transformed.components.schemas)) {
		if (schema && typeof schema === 'object') {
			let fixedSchema = fixNullableTypes(schema as Record<string, unknown>);
			fixedSchema = removeIdFields(fixedSchema) as Record<string, unknown>;
			transformed.components.schemas[name] = fixedSchema;
		}
	}

	console.log(`✅ Transformation complete (${transformedCount} inline schemas converted to $ref)`);
	return transformed;
}

async function fetchAndTransformOpenAPI(): Promise<void> {
	const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
	const url = `${BACKEND_URL}/api/openapi/json`;

	console.log(`📥 Fetching OpenAPI spec from ${url}...`);

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
	}

	const spec = (await response.json()) as OpenAPIObject;
	const transformed = transformOpenAPISpec(spec);

	// Write to frontend directory
	const outputPath = resolve(process.cwd(), 'openapi.json');
	writeFileSync(outputPath, JSON.stringify(transformed, null, 2));

	console.log(`💾 Saved transformed spec to ${outputPath}`);
}

fetchAndTransformOpenAPI().catch((error) => {
	console.error('❌ Failed to fetch and transform OpenAPI spec:', error);
	process.exit(1);
});
