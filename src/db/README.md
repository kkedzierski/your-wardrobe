# Migracje bazy danych

## Automatyczne budowanie registry migracji SQL

W projekcie korzystamy z generatora `db/generateMigrationsRegistry.ts`, który:

- automatycznie przepisuje wszystkie Twoje .up.sql i .down.sql do pliku TS registry (`src/db/MigrationsRegistry.ts`),
- pozwala łatwo zarządzać wersjami i kolejnością migracji – wszystko na podstawie plików SQL,
- działa **tylko na etapie development/build**; NIE generuje żadnych efektów w produkcyjnej aplikacji mobilnej, nie wymaga node.js na telefonie.

### Jak używać?

1. **Dodaj nowe pliki migracji** (zgodnie z konwencją):
   - `src/db/migrations/YYYYMMDDHHMMSS_nazwa_migracji.up.sql`
   - `src/db/migrations/YYYYMMDDHHMMSS_nazwa_migracji.down.sql`
2. **Uruchom generator registry migracji:**
   - Przez _npm_: `npm run generate:migrations`
   - Przez _yarn_: `yarn generate:migrations`
   - Lub bezpośrednio: `npx ts-node db/generateMigrationsRegistry.ts`
3. **Commituj plik `src/db/MigrationsRegistry.ts`** (jest generowany — nie edytuj ręcznie!)
4. **Reszta projektu korzysta już tylko z registry.**

### FAQ

- **Dlaczego nie importuję .sql do kodu?**
  Metro bundler w Expo/React Native nie wspiera dynamicznych importów plików .sql jako surowe stringi. Registry jest de facto napędem DDD migracji dla mobile.
- **Czy node/ts-node jest wymagany na urządzeniu?**
  NIE. Skrypt działa tylko w środowisku developera/CI/CD, nigdy w produkcyjnej aplikacji ani na telefonie użytkownika.

---

## Konfiguracja instancji / wielokrotnego użycia

Twój katalog `src/db` jest w pełni niezależny projektowo — możesz go przekleić do innego projektu i dzięki konfiguracji poniżej (nazwa bazy przez .env lub app.config.js) integracja będzie natychmiastowa.

### Konfiguracja nazwy bazy (Multitenancy/Feature toggling)

- Domyślną nazwę bazy ustalasz zmienną środowiskową:
  - `.env`: `DB_NAME=my-app-db.sqlite`
  - lub w Expo EAS (`app.config.js`/`app.config.json`):
    ```js
    export default ({ config }) => ({
      ...config,
      extra: {
        ...config.extra,
        DB_NAME: "customapp.db",
      },
    });
    ```

W pliku `database.ts` mechanizm jest już gotowy.

---

## Jak dodać nową migrację?

1. **Stwórz dwa pliki SQL — migracja do przodu / rollback:**

   - `YYYYMMDDHHMMSS_nazwa_migracji.up.sql` — kod SQL tworzący strukturę/tabelę/zmiany itp.
   - `YYYYMMDDHHMMSS_nazwa_migracji.down.sql` — kod SQL odwracający zmiany (DROP TABLE, ALTER TABLE, itp.)

   Przykład:

   - `20251022151045_create_initial_schema.up.sql`
   - `20251022151045_create_initial_schema.down.sql`

2. **Dodaj importy do pliku `MigrationsRegistry.ts`** (w katalogu `src/db/`):

```ts
import nextUp from "./migrations/20251111073000_alter_table_x.up.sql";
import nextDown from "./migrations/20251111073000_alter_table_x.down.sql";

export const getUpMigrations = () => [
  ...istniejące,
  new Migration("20251111073000_alter_table_x.up.sql", nextUp as string),
];
export const getDownMigrations = () => [
  new Migration("20251111073000_alter_table_x.down.sql", nextDown as string),
  ...istniejące,
];
```

3. **Gotowe!** Zadbaj o unikalność znaczników czasu na początku nazwy migracji.

## Reguły migracji:

- Kolejność wykonywana wg rosnącej daty (migracje up) lub malejącej (down/rollback).
- Plik `MigrationsRegistry.ts` jest jedynym miejscem do "rejestracji" migracji.
- Każdy plik sql powinien zawierać **dokładnie jedną zmianę schematu!**
- Zalecany styl: keep it simple i atomic (jeden feature/jedna migracja = jedna para up/down)

## Przykład wywołań:

```ts
import { MigrationManager, MigrationType } from "./db";
const mgr = new MigrationManager();
await mgr.applyAllUpMigrations();
// lub uniwersalnie:
import { runMigrations } from "./db";
await runMigrations(MigrationType.Up); // lub Down
```

## Struktura

- Każda migracja dostępna jest w plikach: `src/db/migrations/*.up.sql` / `*.down.sql`
- Jeden rejestr zabezpiecza przed powieleniem/dwukrotnym wykonaniem migracji na tej samej bazie
- Klasa MigrationManager oraz pattern DDD pozwala łatwo rozbudować logikę o testy czy custom workflow migracji
