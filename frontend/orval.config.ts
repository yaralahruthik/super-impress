import { defineConfig } from 'orval';

export default defineConfig({
	'super-impress': {
		input: 'http://localhost:8000/openapi.json',
		output: {
			target: './src/lib/api/superimpress.ts',
			mode: 'tags-split',
			client: 'svelte-query',
			override: {
				mutator: {
					path: 'src/lib/api/axios.ts',
					name: 'customInstance'
				}
			}
		},
		hooks: {
			afterAllFilesWrite: {
				command: 'prettier --write ./src/lib/api/**',
				injectGeneratedDirsAndFiles: false
			}
		}
	},
	'super-impress-zod': {
		input: 'http://localhost:8000/openapi.json',
		output: {
			target: './src/lib/api',
			mode: 'tags-split',
			client: 'zod',
			fileExtension: '.zod.ts'
		},
		hooks: {
			afterAllFilesWrite: {
				command: 'prettier --write ./src/lib/api/**',
				injectGeneratedDirsAndFiles: false
			}
		}
	}
});
