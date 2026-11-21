import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DOWNLOAD_PATH: { schema: (input) => input ?? '' },
	DATABASE_URL: { schema: (input) => input ?? '' }
});
