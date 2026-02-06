ALTER TYPE "public"."social_platform" ADD VALUE 'instagram';--> statement-breakpoint
DROP INDEX "post_publication_unique_idx";--> statement-breakpoint
ALTER TABLE "post_publication" ALTER COLUMN "platform_post_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "post_publication" ADD COLUMN "url" text;