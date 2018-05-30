import { MigrationInterface, QueryRunner } from "typeorm";
import { info } from "winston";

export class RenamePlaylistDescription1527661621857 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        info("Applying migration: Rename Playlist Description");
        await queryRunner.query(`ALTER TABLE "playlist" RENAME COLUMN name TO description`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        info("Reverting migration: Rename Playlist Description");
        await queryRunner.query(`ALTER TABLE "playlist" RENAME COLUMN description TO name`);
    }
}
