import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1748296846659 implements MigrationInterface {
    name = 'InitialSchema1748296846659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar CHECK( "type" IN ('Débito','Crédito','Transferência') ) NOT NULL, "amount" real NOT NULL, "description" varchar(255), "date" date NOT NULL, "sourceAccountId" varchar, "destinationAccountId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "accounts" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar(100) NOT NULL, "type" varchar CHECK( "type" IN ('Corrente','Poupança','Crédito','Investimento') ) NOT NULL, "initialBalance" real NOT NULL DEFAULT (0), "currentBalance" real NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "temporary_transactions" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar CHECK( "type" IN ('Débito','Crédito','Transferência') ) NOT NULL, "amount" real NOT NULL, "description" varchar(255), "date" date NOT NULL, "sourceAccountId" varchar, "destinationAccountId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_c2edf5312a2dff9e7607e4b4a0c" FOREIGN KEY ("sourceAccountId") REFERENCES "accounts" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_e704cd38335d6b334f2fce8caf9" FOREIGN KEY ("destinationAccountId") REFERENCES "accounts" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_transactions"("id", "type", "amount", "description", "date", "sourceAccountId", "destinationAccountId", "createdAt", "updatedAt") SELECT "id", "type", "amount", "description", "date", "sourceAccountId", "destinationAccountId", "createdAt", "updatedAt" FROM "transactions"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`ALTER TABLE "temporary_transactions" RENAME TO "transactions"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" RENAME TO "temporary_transactions"`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar CHECK( "type" IN ('Débito','Crédito','Transferência') ) NOT NULL, "amount" real NOT NULL, "description" varchar(255), "date" date NOT NULL, "sourceAccountId" varchar, "destinationAccountId" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "transactions"("id", "type", "amount", "description", "date", "sourceAccountId", "destinationAccountId", "createdAt", "updatedAt") SELECT "id", "type", "amount", "description", "date", "sourceAccountId", "destinationAccountId", "createdAt", "updatedAt" FROM "temporary_transactions"`);
        await queryRunner.query(`DROP TABLE "temporary_transactions"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
    }

}
