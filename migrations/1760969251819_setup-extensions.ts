import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder) => {
  pgm.createExtension("uuid-ossp");
};

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropExtension("uuid-ossp");
}
