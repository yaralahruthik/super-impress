CREATE TYPE "public"."social_platform" AS ENUM('linkedin', 'twitter', 'facebook');--> statement-breakpoint
CREATE TABLE "post_publication" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"platform" "social_platform" NOT NULL,
	"platform_post_id" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" text,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "post_publication" ADD CONSTRAINT "post_publication_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_publication" ADD CONSTRAINT "post_publication_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "post_publication_unique_idx" ON "post_publication" USING btree ("post_id","platform","account_id");--> statement-breakpoint
CREATE INDEX "post_publication_post_id_idx" ON "post_publication" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_publication_platform_idx" ON "post_publication" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "post_publication_account_id_idx" ON "post_publication" USING btree ("account_id");
