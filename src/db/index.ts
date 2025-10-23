export { Migration } from "./Migration";
export { MigrationManager } from "./MigrationManager";
export { getUpMigrations, getDownMigrations } from "./MigrationsRegistry";
export { MigrationType } from "./MigrationType";

import { MigrationType } from "./MigrationType";
import { MigrationManager } from "./MigrationManager";

export const runMigrations = async (type: MigrationType = MigrationType.Up) => {
  const mgr = new MigrationManager();
  return type === MigrationType.Up
    ? mgr.applyAllUpMigrations()
    : mgr.applyAllDownMigrations();
};
