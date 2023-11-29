DO $$ BEGIN
 CREATE TYPE "run_status" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "run" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" serial NOT NULL,
	"status" "run_status" DEFAULT 'PENDING',
	"data" jsonb NOT NULL,
	"result" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "run" ADD CONSTRAINT "run_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
