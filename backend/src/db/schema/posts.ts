import { type SQL, relations, sql } from "drizzle-orm";
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
    wordCount: integer("word_count").generatedAlwaysAs(
      (): SQL =>
        sql`coalesce(array_length(regexp_split_to_array(nullif(trim(${post.content}), ''), '\\s+'), 1), 0)`,
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

export const postRelations = relations(post, ({ one, many }) => ({
  user: one(user, { fields: [post.userId], references: [user.id] }),
  publications: many(postPublication),
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
