import { Elysia } from 'elysia';
import { betterAuthPlugin } from '../../auth';
import {
	LinkedInConnectionStatus,
	LinkedInError,
	LinkedInPostRequest,
	LinkedInPostResponse,
} from './model';
import { getConnectionStatus, publishPost } from './service';

export const linkedInModule = new Elysia({
	prefix: '/linkedin',
	tags: ['LinkedIn'],
})
	.use(betterAuthPlugin)
	.model({
		LinkedInPostRequest,
		LinkedInPostResponse,
		LinkedInConnectionStatus,
		LinkedInError,
	})
	.get(
		'/status',
		async ({ request }) => {
			const status = await getConnectionStatus(request.headers);
			return status;
		},
		{
			auth: true,
			response: LinkedInConnectionStatus,
			detail: {
				summary: 'Check LinkedIn connection status',
				description:
					'Check if the authenticated user has a LinkedIn account connected',
			},
		},
	)
	.post(
		'/post',
		async ({ body, user, request, set }) => {
			try {
				const result = await publishPost(user.id, body.postId, request.headers);
				return {
					success: true,
					linkedInPostId: result.linkedInPostId,
				};
			} catch (error) {
				set.status = 400;
				return {
					success: false,
					message:
						error instanceof Error ? error.message : 'Failed to publish post',
				};
			}
		},
		{
			auth: true,
			body: LinkedInPostRequest,
			response: {
				200: LinkedInPostResponse,
				400: LinkedInPostResponse,
			},
			detail: {
				summary: 'Publish post to LinkedIn',
				description: 'Publish a post to the authenticated user\'s LinkedIn account',
			},
		},
	);
