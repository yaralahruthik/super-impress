ALTER TABLE "post_publication" ALTER COLUMN "platform" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."social_platform";--> statement-breakpoint
CREATE TYPE "public"."social_platform" AS ENUM('linkedin', 'twitter', 'threads', 'peerlist');--> statement-breakpoint
ALTER TABLE "post_publication" ALTER COLUMN "platform" SET DATA TYPE "public"."social_platform" USING "platform"::"public"."social_platform";--> statement-breakpoint
DROP INDEX "post_status_idx";--> statement-breakpoint
ALTER TABLE "post" DROP COLUMN "status";--> statement-breakpoint
DROP TYPE "public"."post_status";
