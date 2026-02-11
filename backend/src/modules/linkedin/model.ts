import { type Static, Type } from "@sinclair/typebox";

/**
 * Request to publish a post to LinkedIn
 */
export const LinkedInPostRequest = Type.Object({
  postId: Type.String(),
});
export type LinkedInPostRequest = Static<typeof LinkedInPostRequest>;

/**
 * Response after publishing to LinkedIn
 */
export const LinkedInPostResponse = Type.Object({
  success: Type.Boolean(),
  linkedInPostId: Type.Optional(Type.String()),
  message: Type.Optional(Type.String()),
});
export type LinkedInPostResponse = Static<typeof LinkedInPostResponse>;

/**
 * LinkedIn connection status
 */
export const LinkedInConnectionStatus = Type.Object({
  connected: Type.Boolean(),
  accountId: Type.Optional(Type.String()),
  email: Type.Optional(Type.String()),
});
export type LinkedInConnectionStatus = Static<typeof LinkedInConnectionStatus>;

/**
 * Error response
 */
export const LinkedInError = Type.Object({
  error: Type.String(),
});
export type LinkedInError = Static<typeof LinkedInError>;
