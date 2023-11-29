DO $$ BEGIN
 CREATE TYPE "task_status" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "run" RENAME TO "task";--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "run_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "status" SET DATA TYPE task_status;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task" ADD CONSTRAINT "task_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
