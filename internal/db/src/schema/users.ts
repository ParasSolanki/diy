import {
  index,
  pgTable,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { lifecycleDates, primaryId } from "./utils";

export const rolesTable = pgTable(
  "roles",
  {
    id: primaryId(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 2046 }),

    ...lifecycleDates,
  },
  (t) => ({
    name: uniqueIndex().on(t.name),
  })
);

export const permissionsTable = pgTable(
  "permissions",
  {
    id: primaryId(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 2046 }),

    ...lifecycleDates,
  },
  (t) => ({
    name: uniqueIndex().on(t.name),
  })
);

export const departmentsTable = pgTable(
  "departments",
  {
    id: primaryId(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 2046 }),

    ...lifecycleDates,
  },
  (t) => ({
    name: uniqueIndex().on(t.name),
  })
);

export const userRolePermissionsTable = pgTable(
  "user_role_permissions",
  {
    id: primaryId(),

    roleId: varchar("role_id", { length: 255 })
      .notNull()
      .references(() => rolesTable.id, { onDelete: "cascade" }),
    permissionId: varchar("permission_id", { length: 255 })
      .notNull()
      .references(() => permissionsTable.id, { onDelete: "cascade" }),

    ...lifecycleDates,
  },
  (t) => ({
    roleId: index("user_role_permissions_role_idx").on(t.roleId),
    permissionId: index("user_role_permissions_permission_idx").on(
      t.permissionId
    ),
    uniqueRoleIdAndPermissionId: unique().on(t.roleId, t.permissionId),
  })
);

export const usersTable = pgTable(
  "users",
  {
    id: primaryId(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    displayName: varchar("display_name", { length: 255 }),
    avatarUrl: varchar("avatar_url"),
    phone: varchar("phone", { length: 255 }),

    address: varchar("address", { length: 1024 }),
    city: varchar("city", { length: 255 }),
    state: varchar("state", { length: 255 }),
    country: varchar("country", { length: 255 }),

    deactivateAt: timestamp("deactivate_at"),

    roleId: varchar("role_id", { length: 255 })
      .notNull()
      .references(() => rolesTable.id, { onDelete: "no action" }),
    departmentId: varchar("department_id", { length: 255 })
      .notNull()
      .references(() => departmentsTable.id, { onDelete: "no action" }),

    ...lifecycleDates,
  },
  (t) => ({
    email: uniqueIndex().on(t.email),
    roleId: index("users_role_idx").on(t.roleId),
    departmentId: index("users_department_idx").on(t.departmentId),
  })
);

export const userSessionsTable = pgTable(
  "user_sessions",
  {
    id: primaryId(),

    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => ({
    userId: index("user_sessions_user_idx").on(t.userId),
  })
);

export const userPasswordsTable = pgTable(
  "user_passwords",
  {
    id: primaryId(),

    userId: varchar("user_id")
      .notNull()
      .unique()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),

    hashedPassword: varchar("hashed_password", { length: 2048 }).notNull(),

    ...lifecycleDates,
  },
  (t) => ({
    userId: uniqueIndex().on(t.userId),
  })
);

export const userPermissionsTable = pgTable(
  "user_permissions",
  {
    id: primaryId(),

    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),

    permissionId: varchar("permission_id")
      .notNull()
      .references(() => permissionsTable.id, {
        onDelete: "cascade",
      }),

    ...lifecycleDates,
  },
  (t) => ({
    userId: index("user_permissions_user_idx").on(t.userId),
    permissionId: index("user_permissions_permission_idx").on(t.permissionId),
    uniqueUserIdAndPermissionId: unique().on(t.userId, t.permissionId),
  })
);

export const userPasswordResetTokensTable = pgTable(
  "user_password_reset_tokens",
  {
    id: primaryId(),

    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),

    tokenHash: varchar("token_hash", { length: 512 }).notNull().unique(),

    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => ({
    userId: index("user_password_reset_tokens_user_idx").on(t.userId),
    tokenHash: uniqueIndex().on(t.tokenHash),
  })
);
