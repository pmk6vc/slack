import { MigrationBuilder, PgLiteral } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder) => {
  // Users
  pgm.createTable("users", {
    user_id: {
      type: "uuid",
      primaryKey: true,
      default: new PgLiteral("uuid_generate_v4()"),
      notNull: true,
    },
    name: { type: "varchar(255)", notNull: true },
    createdAt: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
  pgm.createIndex("users", "user_id");

  // Channels
  pgm.createTable("channels", {
    channel_id: {
      type: "uuid",
      primaryKey: true,
      default: new PgLiteral("uuid_generate_v4()"),
      notNull: true,
    },
    name: { type: "varchar(255)", notNull: true },
    createdAt: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
  pgm.createIndex("channels", "channel_id");

  // Channel members
  pgm.createTable("channel_members", {
    channel_id: {
      type: "uuid",
      notNull: true,
      references: '"channels"',
      onDelete: "CASCADE",
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
  });
  pgm.addConstraint("channel_members", "channel_members_pkey", {
    primaryKey: ["channel_id", "user_id"],
  });
  pgm.createIndex("channel_members", ["channel_id", "user_id"]);

  // Messages
  pgm.createTable("messages", {
    message_id: {
      type: "uuid",
      primaryKey: true,
      default: new PgLiteral("uuid_generate_v4()"),
      notNull: true,
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    channel_id: {
      type: "uuid",
      notNull: true,
      references: '"channels"',
      onDelete: "CASCADE",
    },
    message: {
      type: "text",
      notNull: true,
    },
    createdAt: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  })
  pgm.createIndex("messages", ["message_id"]);
  pgm.createIndex("messages", ["channel_id", "createdAt"]);
};

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("users", { cascade: true });
  pgm.dropTable("channels", { cascade: true });
  pgm.dropTable("channel_members", { cascade: true });
  pgm.dropTable("messages", { cascade: true });
}
