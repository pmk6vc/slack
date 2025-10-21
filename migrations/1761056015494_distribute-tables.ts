import { MigrationBuilder, PgLiteral } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder) => {
    pgm.sql(`
    SELECT create_reference_table('users');
    SELECT create_reference_table('channels');
    SELECT create_distributed_table('messages', 'message_id');
    `)
};

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.sql(`
    SELECT undistribute_table('messages', cascade_via_foreign_keys := true);
    `)
}
