import { Elysia, t } from "elysia";
import { betterAuthPlugin } from "../../auth";
import {
  PostCreate,
  PostListQuery,
  PostListResponse,
  PostResponse,
  PostUpdate,
} from "./model";
import {
  createPost,
  deletePost,
  getPostById,
  listUserPosts,
  updatePost,
} from "./service";

function toPostResponse(post: {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  createdAt: Date;
  updatedAt: Date;
}): {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
} {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export const postsModule = new Elysia({ prefix: "/posts", tags: ["Posts"] })
  .use(betterAuthPlugin)
  .model({
    PostCreate,
    PostUpdate,
    PostResponse,
    PostListQuery,
    PostListResponse,
    PostError: t.Object({ error: t.String() }),
  })
  .post(
    "",
    async ({ body, user, set }) => {
      const post = await createPost(user.id, body);
      set.status = 201;
      return post;
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
    },
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
    },
  )
  .get(
    "/:id",
    async ({ params, user, set }) => {
      const post = await getPostById(params.id, user.id);
      if (!post) {
        set.status = 404;
        return { error: "Post not found" };
      }
      return toPostResponse(post);
    },
    {
      auth: true,
      params: t.Object({ id: t.String({ format: "uuid" }) }),
      response: {
        200: "PostResponse",
        404: "PostError",
      },
      detail: {
        summary: "Get a post",
        description: "Get a specific post by ID",
      },
    },
  )
  .patch(
    "/:id",
    async ({ params, body, user, set }) => {
      const post = await updatePost(params.id, user.id, body);
      if (!post) {
        set.status = 404;
        return { error: "Post not found" };
      }
      return toPostResponse(post);
    },
    {
      auth: true,
      params: t.Object({ id: t.String({ format: "uuid" }) }),
      body: "PostUpdate",
      response: {
        200: "PostResponse",
        404: "PostError",
      },
      detail: {
        summary: "Update a post",
        description: "Update a specific post by ID",
      },
    },
  )
  .delete(
    "/:id",
    async ({ params, user, set }) => {
      const deleted = await deletePost(params.id, user.id);
      if (!deleted) {
        set.status = 404;
        return { error: "Post not found" };
      }
      set.status = 204;
    },
    {
      auth: true,
      params: t.Object({ id: t.String({ format: "uuid" }) }),
      response: {
        404: "PostError",
      },
      detail: {
        summary: "Delete a post",
        description: "Delete a specific post by ID",
      },
    },
  );
