import { MigrationInterface, QueryRunner } from 'typeorm';

export class CREATEROLE1693842044417 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "INSERT INTO role (name, permissions) VALUES ('superuser', '{c}'), ('user_viewer', '{r}');",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE TABLE role;');
  }
}
