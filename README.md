# Your Wardrobe

> Offline-first wardrobe management app for iOS/Android (Expo + React Native)

---

## Table of Contents

1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started Locally](#getting-started-locally)
4. [Available Scripts](#available-scripts)
5. [Database Migrations](#database-migrations)
6. [Project Scope](#project-scope)
7. [Project Status](#project-status)
8. [License](#license)

---

## Project Description

**Your Wardrobe** is an offline-first mobile app for iOS and Android designed to help users easily catalog, organize, and manage their clothing collection. The app aims to reduce clutter, simplify wardrobe maintenance, and prevent unnecessary purchases, while ensuring maximum data privacy and a seamless offline experience. Users can add clothes by taking multiple photos, assign categories and attributes manually or with AI assistance, and enjoy fast search and filtering, all without requiring a backend.

> **Key goals:**
>
> - Effortless wardrobe cataloging and organization
> - Privacy-first and offline functionality
> - Reduce overbuying and keep track of existing clothing

For full product requirements and user stories, see [`docs/README.md`](docs/README.md).

---

## Tech Stack

- **Frontend**: [Expo (managed)](https://docs.expo.dev/) + [React Native](https://reactnative.dev/) (TypeScript)
  - React Navigation (stack/tabs navigation)
  - [React Native Paper](https://callstack.github.io/react-native-paper/): accessible UI components
  - [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/): local database storage (CRUD, migrations)
  - [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/), [expo-image-manipulator](https://docs.expo.dev/versions/latest/sdk/image-manipulator/), [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/): photo capture, compression, thumbnailing, file storage
  - [expo-crypto](https://docs.expo.dev/versions/latest/sdk/crypto/): deduplication
  - [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/), [expo-local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/): biometric & PIN lock
  - [react-i18next](https://react.i18next.com/) + [react-native-localize](https://github.com/zoontek/react-native-localize): internationalization (PL now, EN-ready)
- **Backend:** Offline-only in MVP (no remote backend); optional future sync (Supabase)
  - Export/Import (backup v1): Planned via ZIP with JSON + thumbnails
- **AI Assistance** (optional): Category/tag suggestions powered by large language models (cloud-based; user opt-in, "do not send images" mode)
- **DevOps & CI/CD:**
  - [GitHub Actions](https://github.com/features/actions): linting, typechecking, UI testing ([Jest](https://jestjs.io/), [@testing-library/react-native](https://testing-library.com/docs/react-native-testing-library/intro/))
  - [Expo EAS Build & Update](https://docs.expo.dev/eas/): cross-platform builds, OTA updates
  - Optional: Monitoring ([sentry-expo](https://docs.expo.dev/guides/using-sentry/)), public info page via GitHub Pages/Netlify
- **See:** [`package.json`](package.json) for detailed dependencies.

---

## Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://classic.yarnpkg.com/en/docs/install/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) installed globally:  
  `npm install -g expo-cli`

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/your-wardrobe.git
   cd your-wardrobe
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Start the development server:**
   ```bash
   npm start
   # or
   expo start
   ```
4. **Run on your device/emulator:**
   - Android: `npm run android` or use Expo Go app
   - iOS: `npm run ios` or use Expo Go app
   - Web: `npm run web`

For further help, see [Expo documentation](https://docs.expo.dev/) or [`docs/README.md`](docs/README.md).

---

## Available Scripts

The following npm scripts are available (see [`package.json`](package.json)):

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm start`       | Starts Expo development server    |
| `npm run android` | Start in Android emulator/Expo Go |
| `npm run ios`     | Start in iOS simulator/Expo Go    |
| `npm run web`     | Start app in web browser          |

---

## Database Migrations

The local SQLite schema uses versioned SQL file migrations for full transparency, code review, and reproducibility. Migrations are based on a simple DDD registry pattern:

- Each database change is described as a pair of SQL files (up and down, for rollback)
- Files are stored in `src/db/migrations/`, with names like `20251022151045_create_initial_schema.up.sql` and `.down.sql`.
- Every migration must be registered in `src/db/MigrationsRegistry.ts` for the app to apply it (or roll it back)
- The migration system only applies "up" migrations that have not been run yet (tracked in a dedicated `migrations` table in the SQLite DB)

For **detailed workflow and developer instructions, see [`src/db/README.md`](src/db/README.md)**.

_Example developer flow to add migration:_

1. Create a pair of schema migration SQL files in `/src/db/migrations/`:
   - `20251101090000_add_outfits.up.sql`
   - `20251101090000_add_outfits.down.sql`
2. Register in `/src/db/MigrationsRegistry.ts` (see template inside).
3. On next app start/dev run, `MigrationManager` will upgrade DB schema automatically.

_Migrations provide full offline durability and ensure up/down repeatability, making schema evolution deterministic and safe._

---

## Project Scope

**MVP Features:**

- Add clothing with one or more photos
- Manual and AI-assisted categorization/tagging
- Edit, browse, or remove clothing, categories, and tags
- Attribute support: color, size, brand, season, location (all optional)
- Batch actions (change season/location for multiple items)
- Deduplication (perceptual hash), duplicate merging
- Fast search, smart lists, attribute-based filters
- Offline-only operation; sync queue via Wi-Fi (up to 500 images / 500MB); 3MB/photo limit
- Local and in-transit encryption; guest mode and email+magic link sign-in available
- User control over AI suggestions and privacy
- GDPR compliance (explicit consent, hard data delete)

**Out of scope (MVP):**

- No outfit generator/recommendations
- No gallery import/sharing/integrations (e.g., Vinted)
- No on-device AI inference (cloud only for now)
- No data import/export for MVP

See the full [Product Requirements Document](.ai/prd.md) for user stories and detailed acceptance criteria.

---

## Project Status

- **Status:** MVP in development
- **Offline-first**: 100% local storage (no cloud backend required)
- **Sync:** Planned future addition via Supabase (opt-in)
- **Languages:** Polish (primary), English planned
- **Testing:** Minimum user-flow test implemented (add → visible in list)
- **Documentation:** See [`docs/`](docs/) for specifications, system design, privacy, and test plan
- **Success metrics:**
  - ≥75% user acceptance of AI-suggested main categories
  - % wardrobe items with complete attributes (category, location, season)

> Track progress and planned features in project boards/issues.

---

## License

This project is licensed under the [0BSD License](https://opensource.org/licenses/0BSD).

---
