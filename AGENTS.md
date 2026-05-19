  # Repository Guidelines

  ## Project
  Expo React Native app. JavaScript only.

  ## Rules
  - Use JavaScript only. Do not create or convert files to `.ts` or `.tsx`.
  - Use npm only.
  - Ask before modifying files.
  - Ask before installing dependencies.
  - Do not modify `ios/` or `android/` unless explicitly requested.
  - Do not run `expo prebuild` unless explicitly requested.
  - Prefer Expo SDK-compatible solutions.
  - Before Expo-related code, check `package.json` for the installed `expo`
  version and consult the matching versioned Expo docs.

  ## Structure
  - `index.js`: app entry point.
  - `App.js`: root component.
  - `app.json`, `metro.config.js`, `eas.json`: Expo/config files.
  - `ios/`, `android/`: native folders, do not edit without permission.
  - Add assets under `assets/` when needed.

  ## Commands
  Preferred:
  - `npx expo start`: Start Expo development server.

  Native (ask first):
  - `npx expo run:ios`: Build and run on iOS Simulator.
  - `npx expo run:android`: Build and run on Android emulator/device.

  ## Style
  Use functional components, single quotes, semicolons, `StyleSheet.create`,
  PascalCase components, camelCase variables/functions.

  ## Tests
  No test setup yet. If added, use JS files like `*.test.js` and add an npm
  script.

  ## Git
  Use short imperative commits, e.g. `Add login screen`. PRs should include
  summary, test notes, and screenshots for UI changes.