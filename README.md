# Tasks — offline task manager PWA

Static files only: no backend, no network requests for data. Data lives in IndexedDB on the device.

## Set the login
Edit `NICK` and `PASS` at the top of `js/auth.js`. This gate is client-side and offers no real security.

## Host on GitHub Pages
1. Push this folder to a repo (files at the repo root, or in `/docs`).
2. Settings → Pages → deploy from that branch/folder.
3. Open `https://<user>.github.io/<repo>/` (HTTPS is required for the service worker).

## Install on iPhone
Open the URL in Safari → Share → Add to Home Screen.

## Notes
- Offline: after the first load everything is cached. After changing any file, bump `V` in `sw.js` so devices fetch the update.
- Reminders are local: they fire (in-app toast plus system notification, if allowed) while the app is open or resumed. Web apps cannot schedule notifications for a fully closed app without a push server. On iPhone, notifications work only from the home-screen install, after you allow them.
- Backup: Export downloads a JSON file; Import offers Replace or Merge (newest edit wins).
- Clearing Safari website data deletes your tasks, so export regularly.
