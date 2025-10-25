import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder) => {
  // Insert 1000 users using generate_series for efficiency.
  // Use a recognizable name prefix so the down migration can remove them safely.
  pgm.sql(`
    INSERT INTO users (user_id, name, "createdAt")
    SELECT uuid_generate_v4(), 'seed_user_' || gs::text, now()
    FROM generate_series(1, 1000) AS gs;
  `);

  // Insert 100 seed channels (seed_channel_1..seed_channel_100)
  pgm.sql(`
    INSERT INTO channels (channel_id, name, "createdAt")
    SELECT uuid_generate_v4(), 'seed_channel_' || gs::text, now()
    FROM generate_series(1, 100) AS gs;
  `);

  // Populate channel_members: for each seed channel, pick a random number K (1..100)
  // of users and insert membership entries. We use a LATERAL subquery selecting
  // random users per channel.
  pgm.sql(`
    INSERT INTO channel_members (channel_id, user_id)
    SELECT c.channel_id, u.user_id
    FROM channels c
    CROSS JOIN LATERAL (
      SELECT user_id FROM users ORDER BY RANDOM() LIMIT (floor(random() * 100) + 1)::int
    ) u
    WHERE c.name LIKE 'seed_channel_%';
  `);
};

export const down = (pgm: MigrationBuilder) => {
  // Remove seeded channel_members first
  pgm.sql(`
    DELETE FROM channel_members cm
    USING channels c
    WHERE cm.channel_id = c.channel_id
      AND c.name LIKE 'seed_channel_%';
  `);

  // Remove seeded channels
  pgm.sql(`
    DELETE FROM channels WHERE name LIKE 'seed_channel_%';
  `);

  // Remove seeded users
  pgm.sql(`
    DELETE FROM users WHERE name LIKE 'seed_user_%';
  `);
};
