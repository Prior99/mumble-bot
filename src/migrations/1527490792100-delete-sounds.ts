import { MigrationInterface, QueryRunner } from "typeorm";
import { info } from "winston";

export class DeleteSounds1527490792100 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        info("Applying migration: Delete Sounds");
        await queryRunner.query(`ALTER TABLE "sound" ADD COLUMN deleted TIMESTAMP WITHOUT TIME ZONE`);
        await queryRunner.query(`
            UPDATE sound parent
            SET deleted = child.created
            FROM sound child
            WHERE child."parentId" = parent.id
                AND child.overwrite = true
        `);
        await queryRunner.query(`ALTER TABLE "sound" DROP COLUMN overwrite`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        info("Reverting migration: Delete Sounds");
        await queryRunner.query(`ALTER TABLE "sound" DROP COLUMN deleted`);
        await queryRunner.query(`ALTER TABLE "sound" ADD COLUMN overwrite BOOL`);
    }
}
