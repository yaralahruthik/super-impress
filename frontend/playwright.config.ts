import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: [
		{
			command: 'pnpm run dev',
			port: 5173,
			reuseExistingServer: !process.env.CI
		},
		{
			command: 'uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload',
			cwd: '../backend',
			port: 8000,
			reuseExistingServer: !process.env.CI
		}
	],
	testDir: 'e2e',
	use: {
		baseURL: 'http://localhost:5173'
	}
});
