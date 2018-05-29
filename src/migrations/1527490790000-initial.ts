import { MigrationInterface, QueryRunner } from "typeorm";
import { info } from "winston";

export class Initial1527490790000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        info("Applying migration: Initial");
        await queryRunner.query(`
            CREATE TABLE "sound" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "description" text NOT NULL,
                "used" integer NOT NULL DEFAULT 0,
                "source" character varying(16) NOT NULL,
                "created" TIMESTAMP NOT NULL DEFAULT now(),
                "updated" TIMESTAMP NOT NULL DEFAULT now(),
                "overwrite" BOOL NOT NULL DEFAULT false,
                "duration" double precision NOT NULL,
                "userId" uuid,
                "creatorId" uuid,
                "parentId" uuid,
                CONSTRAINT "PK_042a7f5e448107b2fd0eb4dfe8c"
                PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "password" character varying(200) NOT NULL,
                "email" character varying(200) NOT NULL,
                "score" integer NOT NULL DEFAULT 0,
                "enabled" boolean NOT NULL DEFAULT false,
                "admin" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760"
                PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "tag" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                CONSTRAINT "PK_8e4052373c579afc1471f526760"
                PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "sound_tag_relation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "soundId" uuid,
                "tagId" uuid,
                CONSTRAINT "PK_5f47440ba6571ed0ff16997f841"
                PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "playlist_entry" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "position" integer NOT NULL,
                "pitch" integer NOT NULL DEFAULT 0,
                "soundId" uuid,
                "playlistId" uuid,
                CONSTRAINT "PK_013697aa2d3f8b9797e735461a4"
                PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "playlist" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created" TIMESTAMP NOT NULL DEFAULT now(),
                "name" text NOT NULL,
                "used" integer NOT NULL DEFAULT 0,
                "creatorId" uuid,
                CONSTRAINT "PK_538c2893e2024fabc7ae65ad142"
                PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "mumble_link" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "mumbleId" integer NOT NULL,
                "userId" uuid,
                CONSTRAINT "PK_94d08ab634590982e971d960b76"
                PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "token" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created" TIMESTAMP NOT NULL DEFAULT now(),
                "updated" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted" TIMESTAMP WITH TIME ZONE,
                "userId" uuid,
                CONSTRAINT "PK_82fae97f905930df5d62a702fc9"
                PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "sound_rating" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "stars" integer NOT NULL,
                "soundId" uuid,
                "userId" uuid,
                CONSTRAINT "PK_7228de55a548229f25b5607f710"
                PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "sound"
            ADD CONSTRAINT "FK_0d7f8a5e28fbdae85b1f554d99a"
            FOREIGN KEY ("userId")
            REFERENCES "user"("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "sound"
            ADD CONSTRAINT "FK_266b7078efd30e6007b169d0db6"
            FOREIGN KEY ("creatorId")
            REFERENCES "user"("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "sound"
            ADD CONSTRAINT "FK_0cbcf8360d794dcce1c12835ebc"
            FOREIGN KEY ("parentId")
            REFERENCES "sound"("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "sound_tag_relation"
            ADD CONSTRAINT "FK_d6e40718cb1b7e450f2a1b0f56d"
            FOREIGN KEY ("soundId")
            REFERENCES "sound"("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "sound_tag_relation"
            ADD CONSTRAINT "FK_04dd5bd3c568559f18cb29d8e32"
            FOREIGN KEY ("tagId")
            REFERENCES "tag"("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "playlist_entry"
            ADD CONSTRAINT "FK_7d2e0ecb9fd562e5a2cc19a5d15"
            FOREIGN KEY ("soundId")
            REFERENCES "sound"("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "playlist_entry"
            ADD CONSTRAINT "FK_0bf3b973e327a84c2d6143754bd"
            FOREIGN KEY ("playlistId")
            REFERENCES "playlist"("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "playlist"
            ADD CONSTRAINT "FK_2b2e2d0e397930853ded06a8d6b"
            FOREIGN KEY ("creatorId")
            REFERENCES "user"("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "mumble_link"
            ADD CONSTRAINT "FK_f98e18f3853efc02b1bb1157a9e"
            FOREIGN KEY ("userId")
            REFERENCES "user"("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "token"
            ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a"
            FOREIGN KEY ("userId")
            REFERENCES "user"("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "sound_rating"
            ADD CONSTRAINT "FK_8dbfeaf9157c97f96f2d2832680"
            FOREIGN KEY ("soundId")
            REFERENCES "sound"("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "sound_rating"
            ADD CONSTRAINT "FK_f0ea8a89ffeec370787770ab113"
            FOREIGN KEY ("userId")
            REFERENCES "user"("id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        info("Reverting migration: Initial");
        await queryRunner.query(`ALTER TABLE "sound" DROP CONSTRAINT "FK_0d7f8a5e28fbdae85b1f554d99a"`);
        await queryRunner.query(`ALTER TABLE "sound" DROP CONSTRAINT "FK_266b7078efd30e6007b169d0db6"`);
        await queryRunner.query(`ALTER TABLE "sound" DROP CONSTRAINT "FK_0cbcf8360d794dcce1c12835ebc"`);
        await queryRunner.query(`ALTER TABLE "sound_tag_relation" DROP CONSTRAINT "FK_d6e40718cb1b7e450f2a1b0f56d"`);
        await queryRunner.query(`ALTER TABLE "sound_tag_relation" DROP CONSTRAINT "FK_04dd5bd3c568559f18cb29d8e32"`);
        await queryRunner.query(`ALTER TABLE "playlist_entry" DROP CONSTRAINT "FK_7d2e0ecb9fd562e5a2cc19a5d15"`);
        await queryRunner.query(`ALTER TABLE "playlist_entry" DROP CONSTRAINT "FK_0bf3b973e327a84c2d6143754bd"`);
        await queryRunner.query(`ALTER TABLE "playlist" DROP CONSTRAINT "FK_2b2e2d0e397930853ded06a8d6b"`);
        await queryRunner.query(`ALTER TABLE "mumble_link" DROP CONSTRAINT "FK_f98e18f3853efc02b1bb1157a9e"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`);
        await queryRunner.query(`ALTER TABLE "sound_rating" DROP CONSTRAINT "FK_8dbfeaf9157c97f96f2d2832680"`);
        await queryRunner.query(`ALTER TABLE "sound_rating" DROP CONSTRAINT "FK_f0ea8a89ffeec370787770ab113"`);
        await queryRunner.query(`DROP TABLE "sound"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "tag"`);
        await queryRunner.query(`DROP TABLE "sound_tag_relation"`);
        await queryRunner.query(`DROP TABLE "playlist_entry"`);
        await queryRunner.query(`DROP TABLE "playlist"`);
        await queryRunner.query(`DROP TABLE "mumble_link"`);
        await queryRunner.query(`DROP TABLE "token"`);
        await queryRunner.query(`DROP TABLE "sound_rating"`);
    }
}
