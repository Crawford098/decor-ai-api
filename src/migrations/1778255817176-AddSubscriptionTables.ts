import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubscriptionTables1778255817176 implements MigrationInterface {
    name = 'AddSubscriptionTables1778255817176'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "tags_userId_fkey"`);
        await queryRunner.query(`ALTER TABLE "palette_tags" DROP CONSTRAINT "palette_tags_tagId_fkey"`);
        await queryRunner.query(`ALTER TABLE "palette_tags" DROP CONSTRAINT "palette_tags_paletteId_fkey"`);
        await queryRunner.query(`ALTER TABLE "palettes" DROP CONSTRAINT "palettes_userId_fkey"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "users_profileId_fkey"`);
        await queryRunner.query(`ALTER TABLE "designs" DROP CONSTRAINT "designs_userId_fkey"`);
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "images_worldId_fkey"`);
        await queryRunner.query(`ALTER TABLE "works_done" DROP CONSTRAINT "works_done_designId_fkey"`);
        await queryRunner.query(`ALTER TABLE "works_done" DROP CONSTRAINT "works_done_paletteId_fkey"`);
        await queryRunner.query(`ALTER TABLE "works_done" DROP CONSTRAINT "works_done_userId_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."palette_tags_tagId_paletteId_key"`);
        await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "tags_created_by_check"`);
        await queryRunner.query(`ALTER TABLE "palettes" DROP CONSTRAINT "palettes_created_by_check"`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("subscriptionId" SERIAL NOT NULL, "userId" integer NOT NULL, "provider" character varying(50) NOT NULL DEFAULT 'revenuecat', "store" character varying(50) NOT NULL, "productId" character varying(255) NOT NULL, "entitlement" character varying(100) NOT NULL, "status" character varying(50) NOT NULL, "expiresAt" TIMESTAMP, "willRenew" boolean NOT NULL DEFAULT false, "originalTransactionId" character varying(500), "latestTransactionId" character varying(500), "environment" character varying(20) NOT NULL DEFAULT 'production', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_06ba17ac2e047b1ef52051edf09" PRIMARY KEY ("subscriptionId"))`);
        await queryRunner.query(`CREATE TABLE "subscription_events" ("eventId" SERIAL NOT NULL, "externalEventId" character varying(500) NOT NULL, "userId" integer, "eventType" character varying(100) NOT NULL, "provider" character varying(50) NOT NULL DEFAULT 'revenuecat', "payload" jsonb NOT NULL, "processedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c7e4e785250d76238eeb8d713f9" PRIMARY KEY ("eventId"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e3ba92c6eb7486eeb1c97e2ec9" ON "subscription_events" ("externalEventId") `);
        await queryRunner.query(`ALTER TABLE "tags" ALTER COLUMN "created_date" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "palette_tags" ALTER COLUMN "created_date" SET DEFAULT now()`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "palettes_paletteId_seq" OWNED BY "palettes"."paletteId"`);
        await queryRunner.query(`ALTER TABLE "palettes" ALTER COLUMN "paletteId" SET DEFAULT nextval('"palettes_paletteId_seq"')`);
        await queryRunner.query(`ALTER TABLE "palettes" ALTER COLUMN "paletteId" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "palettes" ALTER COLUMN "created_date" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "designs" DROP COLUMN "img"`);
        await queryRunner.query(`ALTER TABLE "designs" ADD "img" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "palette_tags" ADD CONSTRAINT "UQ_c8d4c2cdded5493764d3933f7ed" UNIQUE ("tagId", "paletteId")`);
        await queryRunner.query(`ALTER TABLE "tags" ADD CONSTRAINT "FK_92e67dc508c705dd66c94615576" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "palette_tags" ADD CONSTRAINT "FK_d57b8bc67a31cc0038b0c699c73" FOREIGN KEY ("tagId") REFERENCES "tags"("tagId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "palette_tags" ADD CONSTRAINT "FK_aca48f39b9965f4f4fc0cd802f7" FOREIGN KEY ("paletteId") REFERENCES "palettes"("paletteId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "palettes" ADD CONSTRAINT "FK_477d8ed798e7404015607bb1847" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_b1bda35cdb9a2c1b777f5541d87" FOREIGN KEY ("profileId") REFERENCES "profile"("profileId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "designs" ADD CONSTRAINT "FK_452724f63c3299ac729f24c0d5a" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_33ebc5c95a9005999859ac05032" FOREIGN KEY ("worldId") REFERENCES "works_done"("worldId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "works_done" ADD CONSTRAINT "FK_1e01f1ecf0a8ac70b2a92de8da8" FOREIGN KEY ("designId") REFERENCES "designs"("designId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "works_done" ADD CONSTRAINT "FK_6e71eeed6b09ff50772eb9c2bde" FOREIGN KEY ("paletteId") REFERENCES "palettes"("paletteId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "works_done" ADD CONSTRAINT "FK_1a4f227e64a3dd36a480c1e7d05" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "works_done" DROP CONSTRAINT "FK_1a4f227e64a3dd36a480c1e7d05"`);
        await queryRunner.query(`ALTER TABLE "works_done" DROP CONSTRAINT "FK_6e71eeed6b09ff50772eb9c2bde"`);
        await queryRunner.query(`ALTER TABLE "works_done" DROP CONSTRAINT "FK_1e01f1ecf0a8ac70b2a92de8da8"`);
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_33ebc5c95a9005999859ac05032"`);
        await queryRunner.query(`ALTER TABLE "designs" DROP CONSTRAINT "FK_452724f63c3299ac729f24c0d5a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_b1bda35cdb9a2c1b777f5541d87"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`ALTER TABLE "palettes" DROP CONSTRAINT "FK_477d8ed798e7404015607bb1847"`);
        await queryRunner.query(`ALTER TABLE "palette_tags" DROP CONSTRAINT "FK_aca48f39b9965f4f4fc0cd802f7"`);
        await queryRunner.query(`ALTER TABLE "palette_tags" DROP CONSTRAINT "FK_d57b8bc67a31cc0038b0c699c73"`);
        await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "FK_92e67dc508c705dd66c94615576"`);
        await queryRunner.query(`ALTER TABLE "palette_tags" DROP CONSTRAINT "UQ_c8d4c2cdded5493764d3933f7ed"`);
        await queryRunner.query(`ALTER TABLE "designs" DROP COLUMN "img"`);
        await queryRunner.query(`ALTER TABLE "designs" ADD "img" text`);
        await queryRunner.query(`ALTER TABLE "palettes" ALTER COLUMN "created_date" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "palettes" ALTER COLUMN "paletteId" SET DEFAULT nextval('"color_palettes_paletteId_seq"')`);
        await queryRunner.query(`ALTER TABLE "palettes" ALTER COLUMN "paletteId" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "palettes_paletteId_seq"`);
        await queryRunner.query(`ALTER TABLE "palette_tags" ALTER COLUMN "created_date" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tags" ALTER COLUMN "created_date" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3ba92c6eb7486eeb1c97e2ec9"`);
        await queryRunner.query(`DROP TABLE "subscription_events"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`ALTER TABLE "palettes" ADD CONSTRAINT "palettes_created_by_check" CHECK (((created_by)::text = ANY ((ARRAY['SYSTEM'::character varying, 'USER'::character varying])::text[])))`);
        await queryRunner.query(`ALTER TABLE "tags" ADD CONSTRAINT "tags_created_by_check" CHECK (((created_by)::text = ANY ((ARRAY['SYSTEM'::character varying, 'USER'::character varying])::text[])))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "palette_tags_tagId_paletteId_key" ON "palette_tags" ("tagId", "paletteId") `);
        await queryRunner.query(`ALTER TABLE "works_done" ADD CONSTRAINT "works_done_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "works_done" ADD CONSTRAINT "works_done_paletteId_fkey" FOREIGN KEY ("paletteId") REFERENCES "palettes"("paletteId") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "works_done" ADD CONSTRAINT "works_done_designId_fkey" FOREIGN KEY ("designId") REFERENCES "designs"("designId") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "images_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "works_done"("worldId") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "designs" ADD CONSTRAINT "designs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "users_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("profileId") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "palettes" ADD CONSTRAINT "palettes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "palette_tags" ADD CONSTRAINT "palette_tags_paletteId_fkey" FOREIGN KEY ("paletteId") REFERENCES "palettes"("paletteId") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "palette_tags" ADD CONSTRAINT "palette_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("tagId") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tags" ADD CONSTRAINT "tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

}
