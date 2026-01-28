import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import { db } from './db';
import * as schema from './db/schema';

export const auth = betterAuth({
	basePath: '/api',
	trustedOrigins: ['http://localhost:5173'],
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	account: {
		accountLinking: {
			enabled: true,
		},
	},
	plugins: [openAPI()],
});

// OpenAPI schema extraction for @elysiajs/openapi integration
let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
// biome-ignore lint: https://elysiajs.com/integrations/better-auth.html#openapi
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

export const OpenAPI = {
	getPaths: (prefix = '/auth/api') =>
		getSchema().then(({ paths }) => {
			const reference: typeof paths = Object.create(null);
			for (const path of Object.keys(paths)) {
				const key = prefix + path;
				reference[key] = paths[path];
				for (const method of Object.keys(paths[path])) {
					const operation = (reference[key] as any)[method];
					operation.tags = ['Better Auth'];
				}
			}
			return reference;
		}) as Promise<any>,
	components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
