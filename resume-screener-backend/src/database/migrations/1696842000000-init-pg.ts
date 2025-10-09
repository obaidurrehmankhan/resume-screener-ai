import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPg1696842000000 implements MigrationInterface {
    name = 'InitPg1696842000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // -------------------------------------------------------------
        // Extensions (safe to re-run)
        // -------------------------------------------------------------
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
        // await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

        // -------------------------------------------------------------
        // Enums (idempotent via DO blocks)
        // -------------------------------------------------------------
        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typname = 'user_role_enum' AND n.nspname = 'public'
        ) THEN
          CREATE TYPE "public"."user_role_enum" AS ENUM ('user', 'admin');
        END IF;
      END$$;
    `);

        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typname = 'draft_status_enum' AND n.nspname = 'public'
        ) THEN
          CREATE TYPE "public"."draft_status_enum" AS ENUM ('draft', 'final');
        END IF;
      END$$;
    `);

        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typname = 'file_kind_enum' AND n.nspname = 'public'
        ) THEN
          CREATE TYPE "public"."file_kind_enum" AS ENUM ('resume', 'jd');
        END IF;
      END$$;
    `);

        // -------------------------------------------------------------
        // Tables
        // -------------------------------------------------------------
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL,
        "password_hash" varchar NOT NULL,
        "role" "public"."user_role_enum" NOT NULL DEFAULT 'user',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_users_email_ci" UNIQUE (email)
      );
    `);

        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ux_users_email_lower"
      ON "users"(lower(email));
    `);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "drafts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid,
        "guest_session_id" uuid,
        "is_guest" boolean NOT NULL DEFAULT false,
        "expires_at" timestamptz,
        "title" varchar,
        "resume_text" text,
        "jd_text" text,
        "resume_file_path" varchar,
        "jd_file_path" varchar,
        "status" "public"."draft_status_enum" NOT NULL DEFAULT 'draft',
        "deleted_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_drafts_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "analyses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "draft_id" uuid NOT NULL,
        "match_score" double precision NOT NULL,
        "ats_score" double precision,
        "suggestions_json" jsonb,
        "model" varchar NOT NULL,
        "tokens_used" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "chk_scores_range" CHECK (
          ("match_score" BETWEEN 0 AND 100)
          AND (ats_score IS NULL OR ats_score BETWEEN 0 AND 100)
        ),
        CONSTRAINT "fk_analyses_draft"
          FOREIGN KEY ("draft_id")
          REFERENCES "drafts"("id") ON DELETE CASCADE
      );
    `);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rewrites" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "draft_id" uuid NOT NULL,
        "version" integer NOT NULL,
        "content_json" jsonb NOT NULL,
        "model" varchar NOT NULL,
        "tokens_used" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_rewrites_draft_version" UNIQUE ("draft_id","version"),
        CONSTRAINT "fk_rewrites_draft"
          FOREIGN KEY ("draft_id")
          REFERENCES "drafts"("id") ON DELETE CASCADE
      );
    `);

        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "files" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid,
        "guest_session_id" uuid,
        "kind" "public"."file_kind_enum" NOT NULL,
        "path" varchar NOT NULL,
        "mime" varchar NOT NULL,
        "size" bigint NOT NULL,
        "extracted_text" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_files_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

        // -------------------------------------------------------------
        // Indexes
        // -------------------------------------------------------------
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_drafts_user_id" ON "drafts" ("user_id");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_drafts_guest_session_id" ON "drafts" ("guest_session_id");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_drafts_expires_at" ON "drafts" ("expires_at");`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_analyses_draft_id_created_at" ON "analyses" ("draft_id","created_at");`);

        // -------------------------------------------------------------
        // Trigger for updated_at (correct syntax)
        // -------------------------------------------------------------
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

        // Drop and recreate triggers safely
        await queryRunner.query(`
      DROP TRIGGER IF EXISTS set_updated_at_drafts ON "drafts";
      CREATE TRIGGER set_updated_at_drafts
      BEFORE UPDATE ON "drafts"
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);

        await queryRunner.query(`
      DROP TRIGGER IF EXISTS set_updated_at_users ON "users";
      CREATE TRIGGER set_updated_at_users
      BEFORE UPDATE ON "users"
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Triggers
        await queryRunner.query(`DROP TRIGGER IF EXISTS set_updated_at_drafts ON "drafts";`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS set_updated_at_users ON "users";`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS set_updated_at;`);

        // Indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_analyses_draft_id_created_at";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_drafts_expires_at";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_drafts_guest_session_id";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_drafts_user_id";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "ux_users_email_lower";`);

        // Tables
        await queryRunner.query(`DROP TABLE IF EXISTS "files";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "rewrites";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "analyses";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "drafts";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users";`);

        // Enums
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."file_kind_enum";`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."draft_status_enum";`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum";`);
    }
}
