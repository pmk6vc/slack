import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder) => {
  // Insert 1000 users using generate_series for efficiency.
  // Use a recognizable name prefix so the down migration can remove them safely.
  pgm.sql(`
    INSERT INTO users (user_id, name, "createdAt")
    SELECT uuid_generate_v4(), 'seed_user_' || gs::text, now()
    FROM generate_series(1, 1000) AS gs;
  `);
};

export const down = (pgm: MigrationBuilder) => {
  // Remove users created by this migration (those that match the seed prefix)
  pgm.sql(`
    DELETE FROM users WHERE name LIKE 'seed_user_%';
  `);
};
