import { MigrationInterface, QueryRunner } from 'typeorm';

export class CREATEROLE1693842044417 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      // "INSERT INTO role (name, permissions) VALUES ('superuser', '{c}'), ('user_viewer', '{r}');",
      `
      INSERT INTO "user" (first_name, last_name, phone) 
      VALUES ('Mock', 'User', '0');
      INSERT INTO account (email, password, "userId") 
      VALUES ('mockuser@user.com', '0', (SELECT max(id) from "user"));
      INSERT INTO organization ("userId", name, phone, address) 
      VALUES ((SELECT max(id) from "user"), 'Org1', '0', 'Kyiv');
      INSERT INTO rental_object ("organizationId", price_per_hour, name, phone, address)
      VALUES ((SELECT max(id) from "organization"), 250, 'RentalObj1','+3000000000', 'Kyiv');
      INSERT INTO equipment ("userId", name, price_per_hour)
      VALUES ((SELECT max(id) from "user"), 'ball', 30);
      INSERT INTO client ("userId", first_name, last_name, phone)
      VALUES ((SELECT max(id) from "user"), 'Mityay', 'Babay', '3000000000');
      INSERT INTO "order" ("userId", status, "clientId")
      VALUES ((SELECT max(id) from "user"), 'paid', (SELECT max(id) from "client"));
      INSERT INTO reservation ("userId", "rentalObjectId", "organizationId", 
                                reservation_time_start, reservation_time_end,
                                price, "orderId")
      VALUES ((SELECT max(id) from "user"), 
      (SELECT max(id) from "rental_object"),
      (SELECT max(id) from "organization"),
      '2023-10-22 10:17:47.539',
      '2023-10-22 15:17:47.539',
      750,
      (SELECT max(id) from "order"));
      INSERT INTO reservation ("userId", "equipmentId", "organizationId", 
                                reservation_time_start, reservation_time_end,
                                price, "orderId")
      VALUES ((SELECT max(id) from "user"), 
      (SELECT max(id) from "equipment"),
      (SELECT max(id) from "organization"),
      '2023-10-22 10:17:47.539',
      '2023-10-22 15:17:47.539',
      90,
      (SELECT max(id) from "order"));
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE TABLE role;');
  }
}
