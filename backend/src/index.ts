import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { betterAuthPlugin, OpenAPI } from './auth';
import { linkedInModule } from './modules/linkedin';
import { postsModule } from './modules/posts';

const app = new Elysia({
	prefix: '/api',
})
	.use(
		openapi({
			documentation: {
				info: {
					title: 'Super Impress API',
					version: '1.0.0',
					description: 'LinkedIn post management tool API',
				},
				components: await OpenAPI.components,
				paths: await OpenAPI.getPaths(),
			},
		}),
	)
	.use(
		cors({
			origin: 'http://localhost:5173',
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
			credentials: true,
			allowedHeaders: ['Content-Type', 'Authorization'],
		}),
	)
	.use(betterAuthPlugin)
	.use(postsModule)
	.use(linkedInModule)
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
