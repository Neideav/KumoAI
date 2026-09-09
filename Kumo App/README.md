# Kumo App — Android APK (Capacitor Wrapper)

Proyek ini membungkus web app **Kumo AI** (dari folder `../KumoAI`) menjadi APK Android native menggunakan **Capacitor** dari Ionic.

## Struktur Folder

```
Kumo App/
├── android/           ← Native Android project (auto-generated)
├── www/               ← Copy dari KumoAI/dist/ (web assets)
├── capacitor.config.json
├── package.json
└── README.md
```

## Prasyarat

- **Node.js** 18+
- **Java JDK** 17+
- **Android SDK** (via Android Studio atau command-line tools)
- `ANDROID_HOME` environment variable harus diset

## Workflow

### 1. Build & Sync (Full)
```bash
npm run sync
```
Ini akan:
- Build web app dari `../KumoAI`
- Copy `dist/` ke `www/`
- Sync ke Android project

### 2. Build APK (Debug)
```bash
npm run build:apk
```

### 3. Buka di Android Studio
```bash
npm run open
```

### 4. Run di Emulator/Device
```bash
npm run run:android
```

## Lokasi Output APK

```
android/app/build/outputs/apk/debug/app-debug.apk
```
