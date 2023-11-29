DO $$ BEGIN
 CREATE TYPE "run_status" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "tables" RENAME TO "runs";--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "visibility" SET DEFAULT 'PRIVATE';--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "prompt" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "project_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "status" "run_status" DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "result" jsonb;--> statement-breakpoint
ALTER TABLE "runs" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "runs" ADD CONSTRAINT "runs_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
