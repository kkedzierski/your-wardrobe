# Your Wardrobe

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Table of Contents

1. [Project Name](#project-name)
2. [Project Description](#project-description)
3. [Tech Stack](#tech-stack)
4. [Getting Started Locally](#getting-started-locally)
5. [Available Scripts](#available-scripts)
6. [Project Scope](#project-scope)
7. [Project Status](#project-status)
8. [License](#license)

---

## Project Name

Your Wardrobe

---

## Project Description

Your Wardrobe is an offline-first mobile application for iOS and Android that enables users to easily catalog, manage, and organize their wardrobe. Designed with privacy and simplicity in mind, it offers both manual and AI-powered categorization, deduplication, advanced search capabilities, and user-friendly tagging. The goal is to help users reduce wardrobe clutter, avoid unnecessary purchases, and keep private data secure—without requiring a backend in the MVP.

---

## Tech Stack

**Frontend:**

- [Expo (managed workflow)](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) for local storage
- [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/), [expo-image-manipulator](https://docs.expo.dev/versions/latest/sdk/image-manipulator/), [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [expo-crypto](https://docs.expo.dev/versions/latest/sdk/crypto/) (deduplication)
- [expo-local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/), [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) (biometrics + PIN)
- [react-i18next](https://react.i18next.com/), [react-native-localize](https://github.com/zoontek/react-native-localize) (i18n, Polish ready, English support planned)

**Backend (MVP):**

- None. All logic and data is offline, stored locally.

**Backend (Post-MVP, optional):**

- [Supabase](https://supabase.com/) (cloud backup/manual sync)

**AI:**

- Category/tag suggestion via LLM (OpenRouter/OpenAI) with switch to disable image uploads (text only by default)

**CI/CD & Hosting:**

- GitHub Actions (linting, typechecking, UI testing)
- Expo EAS Build & OTA Updates
- Expo Go for testing
- (Optional) Sentry, GitHub Pages/Netlify for info/privacy page

---

## Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Yarn](https://classic.yarnpkg.com/) or [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (installed globally):
  ```bash
  npm install -g expo-cli
  ```
- (Optional) [Git](https://git-scm.com/) for cloning the repository

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/your-wardrobe.git
   cd your-wardrobe
   ```
2. Install dependencies:
   ```bash
   yarn install
   # OR
   npm install
   ```

### Running Locally

1. Start the Expo development server:
   ```bash
   yarn start
   # OR
   npm start
   ```
2. Scan the QR code with Expo Go on your iOS or Android device to preview the app.

---

## Available Scripts

| Script         | Description                              |
| -------------- | ---------------------------------------- |
| `yarn start`   | Run Expo in development mode             |
| `yarn android` | Run app on Android emulator/device       |
| `yarn ios`     | Run app on iOS simulator/device          |
| `yarn build`   | (If configured) Build app for production |
| `yarn lint`    | Lint TypeScript/JavaScript code          |
| `yarn test`    | Run unit/UI tests                        |

_All `yarn` commands can be replaced with `npm run` equivalents._

---

## Project Scope

**Core Features:**

- Add clothing items with one or more photos
- Manual and automatic (AI) categorization of clothing
- Edit, view, and delete clothing and categories
- Multi-value tagging; editable categories and tags
- Attribute management (color, size, brand, season, location)
- AI-suggested categories/attributes with user confirmation/correction
- Offline sync queue (500 MB/500 photos max), Wi-Fi only by default
- Photo upload processing (≤3MB/photo): 3 sizes, local cache, optional background removal
- Duplicate detection (perceptual hash), comparison merge view
- Guest mode with option to create an account (e-mail + magic link)
- End-to-end data encryption (local and in-transit)
- Fast search, smart lists (recently added, unused 90 days, "basement"), attribute filters
- GDPR compliance; user consent for processing and model training; permanent data deletion on request

**MVP Limitations/Not included:**

- Outfit suggestions
- Gallery import
- Wardrobe sharing/integrations (e.g., Vinted)
- On-device AI inference (cloud inference only in MVP)
- Export/import features (CSV/ZIP) – post-MVP decision
- No synchronization over mobile data (Wi-Fi only), queue size limits as above

---

## Project Status

MVP stage: core offline-first clothing organization is implemented and under active development. Remote backup/sync, extensions, or cloud features may be added post-MVP (see docs for roadmap and architectural documents).

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

For more details and technical documentation, see the `docs/` directory.
