import { MigrationInterface, QueryRunner } from "typeorm";
import { info } from "winston";

export class AddEchoColumn1528214237445 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        info("Applying migration: Add echo column");
        await queryRunner.query(`ALTER TABLE "playlist_entry" ADD COLUMN echo integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        info("Reverting migration: Add echo column");
        await queryRunner.query(`ALTER TABLE "playlist_entry" DROP COLUMN echo`);
    }
}
