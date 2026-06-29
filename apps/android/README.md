# SSMP Android (Team App)

Coach-facing Android application for the School Sports Competition Management Platform.

## Stack

- **Language:** Kotlin
- **UI:** Jetpack Compose + Material 3
- **Architecture:** MVVM with Hilt DI
- **Networking:** Retrofit + Moshi (generated from OpenAPI spec)
- **Offline:** Room database with pending write-queue
- **Sync:** WorkManager for background sync on reconnect
- **Navigation:** Compose Navigation

## Setup

1. Open `apps/android/` in Android Studio
2. Copy `.env.example` to `.env` and set `BASE_URL` to your API server
3. Sync Gradle and build

## Architecture

```
com.qaphael.ssmp/
├── SSMPApp.kt              # Hilt application
├── MainActivity.kt          # Entry point
├── di/                      # Hilt modules (Network, Database, Repository)
├── data/
│   ├── local/               # Room entities, DAOs, database
│   ├── remote/              # Retrofit API service, DTOs, auth interceptor
│   └── repository/          # TeamRepository, AuthRepository, OfflineQueue
├── sync/                    # WorkManager sync (SyncWorker, SyncScheduler, ConnectivityObserver)
└── ui/
    ├── common/              # Navigation, shared composables
    ├── dashboard/           # Dashboard screen + ViewModel
    ├── roster/              # Roster management screen + ViewModel
    ├── lineup/              # Lineup submission screen + ViewModel
    ├── fixtures/            # Fixtures/results screen + ViewModel
    ├── notifications/       # Notifications screen + ViewModel
    └── theme/               # Compose theme (colors, typography)
```

## Offline Support

Roster edits and lineup submissions are queued locally in Room when offline. On reconnect, WorkManager drains the queue via background sync. The pending write-queue table tracks:
- Entity type (player, lineup, match_event)
- Action (create, update, delete)
- Serialized request payload
- Retry count (max 3 attempts)

## API Integration

Retrofit interfaces are generated from `apps/api/swagger/openapi.yaml`. The `AuthInterceptor` injects JWT Bearer tokens for authenticated requests. Base URL is configurable via `.env`.
