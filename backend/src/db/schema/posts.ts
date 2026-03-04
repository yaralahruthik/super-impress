import { relations } from "drizzle-orm";
import {
  bigint,
  bigserial,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { account, user } from "./auth";

export const socialPlatformEnum = pgEnum("social_platform", [
  "linkedin",
  "twitter",
  "threads",
  "peerlist",
]);

export const scheduleStatusEnum = pgEnum("schedule_status", [
  "pending",
  "processing",
  "published",
  "failed",
  "cancelled",
]);

export const post = pgTable(
  "post",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title"),
    content: text("content").notNull(),
    tags: text("tags").array().default([]).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("post_user_id_idx").on(table.userId),
    index("post_title_idx").on(table.title),
  ]
);

export const postPublication = pgTable(
  "post_publication",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    postId: bigint("post_id", { mode: "number" })
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    platform: socialPlatformEnum("platform").notNull(),
    platformPostId: text("platform_post_id"),
    url: text("url"),
    publishedAt: timestamp("published_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    accountId: text("account_id").references(() => account.id, {
      onDelete: "cascade",
    }),
    metadata: jsonb("metadata"),
  },
  (table) => [
    index("post_publication_post_id_idx").on(table.postId),
    index("post_publication_platform_idx").on(table.platform),
    index("post_publication_account_id_idx").on(table.accountId),
  ]
);

export const postSchedule = pgTable(
  "post_schedule",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    postId: bigint("post_id", { mode: "number" })
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    platform: socialPlatformEnum("platform").notNull(),
    accountId: text("account_id").references(() => account.id, {
      onDelete: "set null",
    }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    status: scheduleStatusEnum("status").notNull().default("pending"),
    error: text("error"),
    attempts: integer("attempts").notNull().default(0),
    publicationId: bigint("publication_id", { mode: "number" }).references(
      () => postPublication.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("post_schedule_post_id_idx").on(table.postId),
    index("post_schedule_user_id_idx").on(table.userId),
    index("post_schedule_scheduled_at_idx").on(table.scheduledAt),
    index("post_schedule_status_idx").on(table.status),
  ]
);

export const postRelations = relations(post, ({ one, many }) => ({
  user: one(user, { fields: [post.userId], references: [user.id] }),
  publications: many(postPublication),
  schedules: many(postSchedule),
}));

export const postPublicationRelations = relations(
  postPublication,
  ({ one }) => ({
    post: one(post, {
      fields: [postPublication.postId],
      references: [post.id],
    }),
    account: one(account, {
      fields: [postPublication.accountId],
      references: [account.id],
    }),
  })
);

export const postScheduleRelations = relations(postSchedule, ({ one }) => ({
  post: one(post, {
    fields: [postSchedule.postId],
    references: [post.id],
  }),
  account: one(account, {
    fields: [postSchedule.accountId],
    references: [account.id],
  }),
  publication: one(postPublication, {
    fields: [postSchedule.publicationId],
    references: [postPublication.id],
  }),
}));
