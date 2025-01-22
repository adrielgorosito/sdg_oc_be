import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1737511044039 implements MigrationInterface {
    name = 'Migration1737511044039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "marca" ("id" nvarchar(255) NOT NULL, "descripcion" nvarchar(255) NOT NULL, CONSTRAINT "UQ_d41856ffd597050edc69ea5188d" UNIQUE ("id"), CONSTRAINT "PK_d41856ffd597050edc69ea5188d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "producto" ("id" nvarchar(255) NOT NULL, "descripcion" nvarchar(255) NOT NULL, "marcaId" nvarchar(255), "proveedorId" nvarchar(255), CONSTRAINT "UQ_5be023b11909fe103e24c740c7d" UNIQUE ("id"), CONSTRAINT "PK_5be023b11909fe103e24c740c7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "proveedor" ("id" nvarchar(255) NOT NULL, CONSTRAINT "UQ_405f60886417ece76cb5681550a" UNIQUE ("id"), CONSTRAINT "PK_405f60886417ece76cb5681550a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "producto" ADD CONSTRAINT "FK_2510e4f057e65f47f9f50583e57" FOREIGN KEY ("marcaId") REFERENCES "marca"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "producto" ADD CONSTRAINT "FK_9153edc7a4ccd432aec010e348f" FOREIGN KEY ("proveedorId") REFERENCES "proveedor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "producto" DROP CONSTRAINT "FK_9153edc7a4ccd432aec010e348f"`);
        await queryRunner.query(`ALTER TABLE "producto" DROP CONSTRAINT "FK_2510e4f057e65f47f9f50583e57"`);
        await queryRunner.query(`DROP TABLE "proveedor"`);
        await queryRunner.query(`DROP TABLE "producto"`);
        await queryRunner.query(`DROP TABLE "marca"`);
    }

}
