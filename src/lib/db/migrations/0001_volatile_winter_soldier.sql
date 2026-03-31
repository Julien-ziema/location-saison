ALTER TABLE "properties" ADD COLUMN "capacity" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "bedrooms" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "bathrooms" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "surface" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "amenities" jsonb;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "photos" jsonb;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "price_per_night" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "default_deposit_percent" integer DEFAULT 30;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "default_caution_amount" integer;