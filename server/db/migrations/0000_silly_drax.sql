CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"url" text NOT NULL,
	"title_original" text NOT NULL,
	"title_en" text NOT NULL,
	"summary_en" text NOT NULL,
	"category" text,
	"published_at" timestamp with time zone NOT NULL,
	"feed_position" integer,
	"llm_score" integer,
	"model" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"homepage_url" text NOT NULL,
	"feed_url" text NOT NULL,
	"region" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");