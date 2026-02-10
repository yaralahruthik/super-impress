import { Elysia, t } from "elysia";
import { betterAuthPlugin } from "../../auth";
import {
  ManualPublicationRequest,
  ManualPublicationResponse,
  type Platform,
  PostCreate,
  PostListQuery,
  PostListResponse,
  PostResponse,
  PostSummaryResponse,
  PostUpdate,
} from "./model";
import {
  createPost,
  deletePost,
  deletePublication,
  getPostById,
  getPostsSummary,
  listUserPosts,
  markAsPublished,
  updatePost,
} from "./service";

// Transforms database Post records (with Date objects) to API responses (with ISO string dates).
// All endpoints MUST use this function to ensure response validation passes.
function toPostResponse(post: {
  id: number;
  userId: string;
  title: string | null;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publications?: Array<{
    id: number;
    platform: Platform;
    platformPostId: string | null;
    url: string | null;
    accountId: string | null;
    publishedAt: Date;
  }>;
}): {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  tags: string[];
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  publications?: Array<{
    id: string;
    platform: Platform;
    platformPostId: string | null;
    url: string | null;
    accountId: string | null;
    publishedAt: string;
  }>;
} {
  const status =
    post.publications && post.publications.length > 0 ? "published" : "draft";

  return {
    ...post,
    id: String(post.id),
    status,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publications: post.publications?.map((pub) => ({
      id: String(pub.id),
      platform: pub.platform,
      platformPostId: pub.platformPostId,
      url: pub.url,
      accountId: pub.accountId,
      publishedAt: pub.publishedAt.toISOString(),
    })),
  };
}

function parseId(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

export const postsModule = new Elysia({ prefix: "/posts", tags: ["Posts"] })
  .use(betterAuthPlugin)
  .model({
    PostCreate,
    PostUpdate,
    PostResponse,
    PostListQuery,
    PostListResponse,
    PostSummaryResponse,
    ManualPublicationRequest,
    ManualPublicationResponse,
    PostError: t.Object({ error: t.String() }),
  })
  .post(
    "",
    async ({ body, user, set }) => {
      const post = await createPost(user.id, body);
      set.status = 201;
      return toPostResponse(post);
    },
    {
      auth: true,
      body: "PostCreate",
      response: {
        201: "PostResponse",
      },
      detail: {
        summary: "Create a new post",
        description: "Create a new post for the authenticated user",
      },
    }
  )
  .get(
    "",
    async ({ query, user }) => {
      const { posts, total } = await listUserPosts({
        userId: user.id,
        status: query.status,
        tag: query.tag,
        limit: query.limit,
        offset: query.offset,
      });
      return {
        posts: posts.map(toPostResponse),
        total,
      };
    },
    {
      auth: true,
      query: "PostListQuery",
      response: "PostListResponse",
      detail: {
        summary: "List posts",
        description:
          "List posts for the authenticated user with optional filtering by status and tag",
      },
    }
  )
  .get(
    "/summary",
    ({ user }) => {
      return getPostsSummary(user.id);
    },
    {
      auth: true,
      response: "PostSummaryResponse",
      detail: {
        summary: "Posts summary",
        description: "Get summary stats and total word count for user posts",
      },
    }
  )
  .get(
    "/:id",
    async ({ params, user, set }) => {
      const postId = parseId(params.id);
      if (!postId) {
        set.status = 400;
        return { error: "Invalid post id" };
      }
      const post = await getPostById(postId, user.id);
      if (!post) {
        set.status = 404;
        return { error: "Post not found" };
      }
      return toPostResponse(post);
    },
    {
      auth: true,
      params: t.Object({ id: t.String({ pattern: "^[0-9]+$" }) }),
      response: {
        200: "PostResponse",
        404: "PostError",
        400: "PostError",
      },
      detail: {
        summary: "Get a post",
        description: "Get a specific post by ID",
      },
    }
  )
  .patch(
    "/:id",
    async ({ params, body, user, set }) => {
      const postId = parseId(params.id);
      if (!postId) {
        set.status = 400;
        return { error: "Invalid post id" };
      }
      const post = await updatePost(postId, user.id, body);
      if (!post) {
        set.status = 404;
        return { error: "Post not found" };
      }
      return toPostResponse(post);
    },
    {
      auth: true,
      params: t.Object({ id: t.String({ pattern: "^[0-9]+$" }) }),
      body: "PostUpdate",
      response: {
        200: "PostResponse",
        404: "PostError",
        400: "PostError",
      },
      detail: {
        summary: "Update a post",
        description: "Update a specific post by ID",
      },
    }
  )
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      const postId = parseId(params.id);
      if (!postId) {
        set.status = 400;
        return { error: "Invalid post id" };
      }
      const deleted = await deletePost(postId, user.id);
      if (!deleted) {
        set.status = 404;
        return { error: "Post not found" };
      }
      set.status = 204;
    },
    {
      auth: true,
      params: t.Object({ id: t.String({ pattern: "^[0-9]+$" }) }),
      response: {
        404: "PostError",
        400: "PostError",
      },
      detail: {
        summary: "Delete a post",
        description: "Delete a specific post by ID",
      },
    }
  )
  .post(
    "/:id/publications",
    async ({ params, body, user, set }) => {
      const postId = parseId(params.id);
      if (!postId) {
        set.status = 400;
        return { error: "Invalid post id" };
      }
      const publication = await markAsPublished(user.id, postId, body);
      if (!publication) {
        set.status = 404;
        return { error: "Post not found" };
      }
      set.status = 201;
      return {
        id: String(publication.id),
        postId: String(publication.postId),
        platform: publication.platform,
        url: publication.url,
        publishedAt: publication.publishedAt.toISOString(),
      };
    },
    {
      auth: true,
      params: t.Object({ id: t.String({ pattern: "^[0-9]+$" }) }),
      body: "ManualPublicationRequest",
      response: {
        201: "ManualPublicationResponse",
        404: "PostError",
        400: "PostError",
      },
      detail: {
        summary: "Mark post as published",
        description: "Manually record that a post was published on a platform",
      },
    }
  )
  .delete(
    "/:id/publications/:publicationId",
    async ({ params, user, set }) => {
      const postId = parseId(params.id);
      const publicationId = parseId(params.publicationId);
      if (!(postId && publicationId)) {
        set.status = 400;
        return { error: "Invalid publication id" };
      }
      const deleted = await deletePublication(user.id, postId, publicationId);
      if (!deleted) {
        set.status = 404;
        return { error: "Publication not found" };
      }
      set.status = 204;
    },
    {
      auth: true,
      params: t.Object({
        id: t.String({ pattern: "^[0-9]+$" }),
        publicationId: t.String({ pattern: "^[0-9]+$" }),
      }),
      response: {
        404: "PostError",
        400: "PostError",
      },
      detail: {
        summary: "Delete publication record",
        description:
          "Delete a publication history entry from a post for the authenticated user",
      },
    }
  );
