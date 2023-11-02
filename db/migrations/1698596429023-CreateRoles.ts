import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoles1698596429023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO permission (action, "subject", "conditions") VALUES ('manage', 'all', NULL), 
      ('manage', 'organization', '{ "created_by": "{{ id }}" }'),
      ('create', 'organization', NULL),
      ('manage', 'trainer', '{ "created_by": "{{ id }}" }'),
      ('create', 'trainer', NULL),
      ('manage', 'manager', '{ "created_by": "{{ id }}" }'),
      ('create', 'manager', NULL),
      ('manage', 'all', NULL),
      ('manage', 'equipment', '{ "created_by": "{{ id }}" }'),
      ('create', 'equipment', NULL),
      ('manage', 'order', '{ "created_by": "{{ id }}" }'),
      ('create', 'order', NULL),
      ('manage', 'support', NULL)`,
    );

    // await queryRunner
    //   .query
    //   // `INSERT INTO role (name) VALUES ('superuser'), ('user_viewer'), ('user');`,
    //   ();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        TRUNCATE TABLE permission;
    `);
  }
}
