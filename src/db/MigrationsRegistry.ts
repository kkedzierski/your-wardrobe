import { Migration } from "./Migration";
import up_001 from "./migrations/20251022151045_create_initial_schema.up.sql";
import down_001 from "./migrations/20251022151045_create_initial_schema.down.sql";

export const getUpMigrations = (): Migration[] => [
  new Migration(
    "20251022151045_create_initial_schema.up.sql",
    up_001 as string
  ),
  // Nową migrację doklej tutaj kolejno!
];

export const getDownMigrations = (): Migration[] => [
  new Migration(
    "20251022151045_create_initial_schema.down.sql",
    down_001 as string
  ),
  // Nową migrację doklej na początek (rollback robisz od końca)
];
