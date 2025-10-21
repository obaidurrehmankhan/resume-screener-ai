import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDraftJobAnalysis1762001000000 implements MigrationInterface {
  name = 'InitDraftJobAnalysis1762001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "analyses" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jobs" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drafts" CASCADE;`);

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."draft_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."draft_source_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."job_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."job_status_enum";`);

    await queryRunner.query(
      `CREATE TYPE "public"."draft_status_enum" AS ENUM ('DRAFT','IN_REVIEW','READY','FINALIZED');`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."draft_source_enum" AS ENUM ('UPLOAD','GENERAL');`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_type_enum" AS ENUM ('analysis.run','rewrite.run','export.render');`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_status_enum" AS ENUM ('queued','running','completed','failed');`,
    );

    await queryRunner.query(`CREATE TABLE "drafts" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"user_id" uuid,"guest_session_id" uuid,"title" varchar(200),"status" "public"."draft_status_enum" NOT NULL DEFAULT 'DRAFT',"source" "public"."draft_source_enum" NOT NULL DEFAULT 'UPLOAD',"resume_text" text,"jd_text" text,"latest_analysis_id" uuid,"latest_rewrite_id" uuid,"finalized_export_id" uuid,"expires_at" timestamptz,"deleted_at" timestamptz,"created_at" timestamptz NOT NULL DEFAULT now(),"updated_at" timestamptz NOT NULL DEFAULT now(),CONSTRAINT "fk_drafts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL);`);

    await queryRunner.query(`CREATE TABLE "jobs" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"draft_id" uuid,"user_id" uuid,"type" "public"."job_type_enum" NOT NULL,"status" "public"."job_status_enum" NOT NULL DEFAULT 'queued',"meta" jsonb,"error" jsonb,"started_at" timestamptz,"finished_at" timestamptz,"created_at" timestamptz NOT NULL DEFAULT now(),"updated_at" timestamptz NOT NULL DEFAULT now(),CONSTRAINT "fk_jobs_draft" FOREIGN KEY ("draft_id") REFERENCES "drafts"("id") ON DELETE SET NULL,CONSTRAINT "fk_jobs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL);`);

    await queryRunner.query(`CREATE TABLE "analyses" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),"draft_id" uuid NOT NULL,"job_id" uuid,"ats_score" integer NOT NULL,"match_score" integer,"missing_skills" text[],"panels_allowed" text[],"parsing_meta" jsonb,"keyword_hits" jsonb,"created_at" timestamptz NOT NULL DEFAULT now(),CONSTRAINT "fk_analyses_draft" FOREIGN KEY ("draft_id") REFERENCES "drafts"("id") ON DELETE CASCADE);`);

    await queryRunner.query(`CREATE INDEX "idx_drafts_user_updated" ON "drafts" ("user_id","updated_at");`);
    await queryRunner.query(`CREATE INDEX "idx_drafts_guest" ON "drafts" ("guest_session_id");`);
    await queryRunner.query(`CREATE INDEX "idx_drafts_status" ON "drafts" ("status");`);
    await queryRunner.query(`CREATE INDEX "idx_jobs_status_type_created" ON "jobs" ("status","type","created_at");`);
    await queryRunner.query(`CREATE INDEX "idx_analyses_draft_created" ON "analyses" ("draft_id","created_at");`);

    await queryRunner.query(`DROP TRIGGER IF EXISTS set_updated_at_drafts ON "drafts";`);
    await queryRunner.query(`CREATE TRIGGER set_updated_at_drafts BEFORE UPDATE ON "drafts" FOR EACH ROW EXECUTE FUNCTION set_updated_at();`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS set_updated_at_jobs ON "jobs";`);
    await queryRunner.query(`CREATE TRIGGER set_updated_at_jobs BEFORE UPDATE ON "jobs" FOR EACH ROW EXECUTE FUNCTION set_updated_at();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS set_updated_at_jobs ON "jobs";`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS set_updated_at_drafts ON "drafts";`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_analyses_draft_created";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_jobs_status_type_created";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_drafts_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_drafts_guest";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_drafts_user_updated";`);

    await queryRunner.query(`DROP TABLE IF EXISTS "analyses";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jobs";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drafts";`);

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."job_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."job_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."draft_source_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."draft_status_enum";`);
  }
}
