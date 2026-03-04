import { Elysia, t } from "elysia";
import { betterAuthPlugin } from "../../auth";
import {
  CreateScheduleRequest,
  ManualPublicationRequest,
  ManualPublicationResponse,
  PostCreate,
  PostListQuery,
  PostListResponse,
  PostResponse,
  PostSummaryResponse,
  PostUpdate,
  PublishHistoryQuery,
  PublishHistoryResponse,
  ScheduleListQuery,
  ScheduleListResponse,
  ScheduleResponse,
  UpdateScheduleRequest,
} from "./model";
import {
  cancelSchedule,
  createPost,
  createSchedule,
  deletePost,
  deletePublication,
  deleteSchedule,
  getPostById,
  getPostsSummary,
  getPublishHistory,
  getSchedulesByPostId,
  listSchedules,
  listUserPosts,
  markAsPublished,
  updatePost,
  updateSchedule,
} from "./service";

function withPostStatus<T>(post: T): T & { status: "draft" | "published" } {
  const publications = (post as { publications?: unknown[] }).publications;

  return {
    ...post,
    status: publications && publications.length > 0 ? "published" : "draft",
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
    CreateScheduleRequest,
    UpdateScheduleRequest,
    ScheduleResponse,
    ScheduleListQuery,
    ScheduleListResponse,
    PublishHistoryQuery,
    PublishHistoryResponse,
    PostError: t.Object({ error: t.String() }),
  })
  .post(
    "",
    async ({ body, user, set }) => {
      const post = await createPost(user.id, body);
      set.status = 201;
      return withPostStatus(post);
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
        posts: posts.map(withPostStatus),
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
  // Calendar view: all schedules in a date range (registered before /:id)
  .get(
    "/schedules",
    async ({ query, user }) => {
      const { schedules, total } = await listSchedules({
        userId: user.id,
        startDate: new Date(query.startDate),
        endDate: new Date(query.endDate),
        status: query.status,
        limit: query.limit,
        offset: query.offset,
      });
      return { schedules, total };
    },
    {
      auth: true,
      query: "ScheduleListQuery",
      response: "ScheduleListResponse",
      detail: {
        summary: "List scheduled posts (calendar)",
        description:
          "List all schedules within a date range for the calendar view",
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
      return withPostStatus(post);
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
      return withPostStatus(post);
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
        204: t.Void(),
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
      return publication;
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
        204: t.Void(),
        404: "PostError",
        400: "PostError",
      },
      detail: {
        summary: "Delete publication record",
        description:
          "Delete a publication history entry from a post for the authenticated user",
      },
    }
  )
  // Schedule endpoints
  .post(
    "/:id/schedules",
    async ({ params, body, user, set }) => {
      const postId = parseId(params.id);
      if (!postId) {
        set.status = 400;
        return { error: "Invalid post id" };
      }
      try {
        const schedule = await createSchedule(user.id, postId, body);
        set.status = 201;
        return schedule;
      } catch (error) {
        set.status = 400;
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to create schedule",
        };
      }
    },
    {
      auth: true,
      params: t.Object({ id: t.String({ pattern: "^[0-9]+$" }) }),
      body: "CreateScheduleRequest",
      response: {
        201: "ScheduleResponse",
        400: "PostError",
      },
      detail: {
        summary: "Schedule a post",
        description: "Create a new schedule to publish a post at a future time",
      },
    }
  )
  .get(
    "/:id/schedules",
    async ({ params, user, set }) => {
      const postId = parseId(params.id);
      if (!postId) {
        set.status = 400;
        return { error: "Invalid post id" };
      }
      const schedules = await getSchedulesByPostId(user.id, postId);
      return { schedules };
    },
    {
      auth: true,
      params: t.Object({ id: t.String({ pattern: "^[0-9]+$" }) }),
      response: {
        200: t.Object({ schedules: t.Array(ScheduleResponse) }),
        400: "PostError",
      },
      detail: {
        summary: "List schedules for a post",
        description: "Get all schedules for a specific post",
      },
    }
  )
  .patch(
    "/:id/schedules/:scheduleId",
    async ({ params, body, user, set }) => {
      const postId = parseId(params.id);
      const scheduleId = parseId(params.scheduleId);
      if (!(postId && scheduleId)) {
        set.status = 400;
        return { error: "Invalid id" };
      }
      try {
        const schedule = await updateSchedule(user.id, scheduleId, body);
        if (!schedule) {
          set.status = 404;
          return { error: "Schedule not found" };
        }
        return schedule;
      } catch (error) {
        set.status = 400;
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to update schedule",
        };
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String({ pattern: "^[0-9]+$" }),
        scheduleId: t.String({ pattern: "^[0-9]+$" }),
      }),
      body: "UpdateScheduleRequest",
      response: {
        200: "ScheduleResponse",
        400: "PostError",
        404: "PostError",
      },
      detail: {
        summary: "Reschedule a post",
        description: "Update the scheduled time for a schedule",
      },
    }
  )
  .delete(
    "/:id/schedules/:scheduleId",
    async ({ params, query, user, set }) => {
      const postId = parseId(params.id);
      const scheduleId = parseId(params.scheduleId);
      if (!(postId && scheduleId)) {
        set.status = 400;
        return { error: "Invalid id" };
      }
      try {
        if (query.action === "delete") {
          const deleted = await deleteSchedule(user.id, scheduleId);
          if (!deleted) {
            set.status = 404;
            return { error: "Schedule not found" };
          }
        } else {
          const cancelled = await cancelSchedule(user.id, scheduleId);
          if (!cancelled) {
            set.status = 404;
            return { error: "Schedule not found" };
          }
        }
        set.status = 204;
      } catch (error) {
        set.status = 400;
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to cancel schedule",
        };
      }
    },
    {
      auth: true,
      params: t.Object({
        id: t.String({ pattern: "^[0-9]+$" }),
        scheduleId: t.String({ pattern: "^[0-9]+$" }),
      }),
      query: t.Object({
        action: t.Optional(
          t.Union([t.Literal("cancel"), t.Literal("delete")], {
            default: "cancel",
          })
        ),
      }),
      response: {
        204: t.Void(),
        400: "PostError",
        404: "PostError",
      },
      detail: {
        summary: "Cancel or delete a schedule",
        description:
          "Cancel a pending schedule or delete a cancelled/failed schedule. Use ?action=delete to permanently remove.",
      },
    }
  )
  // Publish history
  .get(
    "/:id/history",
    async ({ params, query, user, set }) => {
      const postId = parseId(params.id);
      if (!postId) {
        set.status = 400;
        return { error: "Invalid post id" };
      }
      const result = await getPublishHistory(user.id, postId, {
        limit: query.limit,
        offset: query.offset,
      });
      if (!result) {
        set.status = 404;
        return { error: "Post not found" };
      }
      return result;
    },
    {
      auth: true,
      params: t.Object({ id: t.String({ pattern: "^[0-9]+$" }) }),
      query: "PublishHistoryQuery",
      response: {
        200: "PublishHistoryResponse",
        400: "PostError",
        404: "PostError",
      },
      detail: {
        summary: "Post publish history",
        description:
          "Get the full publish history for a post, including scheduled, manual, and direct publications",
      },
    }
  );
