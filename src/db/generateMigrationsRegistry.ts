import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, "../db/migrations");
const registryPath = path.join(__dirname, "../db/MigrationsRegistry.ts");

function getMigrations(suffix: string) {
  return fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(suffix))
    .sort()
    .map((f) => {
      const sql = fs
        .readFileSync(path.join(migrationsDir, f), "utf8")
        .replace(/`/g, "`"); // Escape ` for TS template literals
      return { id: f, sql };
    });
}

const up = getMigrations(".up.sql");
const down = getMigrations(".down.sql");

const render = (arr: { id: string; sql: string }[]) =>
  arr
    .map(
      (m) =>
        `  new Migration("${m.id}", \`
${m.sql.trim()}
\`)`
    )
    .join(",\n");

const file = `import { Migration } from "./Migration";
export const getUpMigrations = (): Migration[] => [
${render(up)}
];

export const getDownMigrations = (): Migration[] => [
${render(down)}
];
`;

fs.writeFileSync(registryPath, file.trim() + "\n", "utf8");
console.log("Wygenerowano src/db/MigrationsRegistry.ts z plików migracji sql.");
