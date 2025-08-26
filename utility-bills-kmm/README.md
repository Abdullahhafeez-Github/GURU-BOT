## Utility Bills PK - Kotlin Multiplatform (Android/iOS)

This repository scaffolds a Kotlin Multiplatform Mobile (KMM) project to check and manage Pakistani utility bills from a single app. It includes:

- Shared Kotlin module (`shared`) containing models, scraping/provider interfaces, and local favorites storage
- Android app (`androidApp`) with a simple UI (Splash, Main, Favorites placeholders)
- iOS app placeholder (`iosApp/`) with notes on integration via the generated `shared` framework

### Current Status
- Scaffolding and core interfaces created.
- A mock provider is wired so the app can run without real scraping credentials.
- Real website scraping providers to be added incrementally (LESCO, IESCO, etc.).

### Build (Android)
1. Open the root folder in Android Studio (Giraffe+ recommended).
2. Let Android Studio install/upgrade the Gradle wrapper and Android SDKs when prompted.
3. Select the `androidApp` configuration and Run.

### iOS Notes
The `shared` module is prepared for KMM. After implementing providers, use Android Studio's KMM wizard (or `gradlew :shared:packForXcode`) to produce a framework for iOS and connect it to an Xcode project. A minimal `iosApp` placeholder is included with guidance.

### Tech
- Kotlin Multiplatform
- Ktor Client (HTTP), kotlinx-serialization
- Multiplatform Settings for local favorites

### Roadmap
- Implement scrapers for target companies using Ktor
- PDF/Print export on Android, Share on iOS
- Favorites list UI and persistence

