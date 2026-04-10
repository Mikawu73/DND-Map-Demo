# DND-CoS-Map

Run the map locally:

```powershell
python sync_server.py
```

By default the server binds to `0.0.0.0`, so devices on the same Wi-Fi/LAN can connect.

Then open:

- Player view on this PC: `http://127.0.0.1:8000/index.html`
- DM view on this PC: `http://127.0.0.1:8000/dm.html`
- Phone/tablet on the same network: `http://<your-pc-ip>:8000/index.html`

## Auth setup

The site now expects Firebase Authentication plus Realtime Database user roles.

### What changed

- Players must sign in with a username and password before seeing the map.
- `dm.html` now requires an authenticated account with role `admin`.
- Non-admin users who try to open `dm.html` are redirected back to `index.html`.
- Map visibility still syncs through Firebase Realtime Database.

### Username format

- Usernames are converted to Firebase email logins behind the scenes.
- Allowed characters: `a-z`, `0-9`, `.`, `_`, `-`
- Length: `3-24`

Example:

- Username: `alice`
- Internal Firebase email: `alice@barovia.local`

### Firebase console steps

1. In Firebase Console, enable `Authentication -> Sign-in method -> Email/Password`.
2. Open the site and create your DM account from the sign-in form.
3. In Firebase Realtime Database, find that user's UID under `users/<uid>`.
4. Change that user's role from `player` to `admin`.
5. Publish Realtime Database rules using [firebase-database.rules.json](d:/Projects/DND_CoS_Map/DND-CoS-Map/firebase-database.rules.json).

Example user profile:

```json
{
  "username": "dm",
  "role": "admin",
  "createdAt": "2026-04-10T00:00:00.000Z",
  "lastLoginAt": "2026-04-10T00:00:00.000Z"
}
```

### Realtime Database structure

```json
{
  "maps": {
    "barovia": {
      "markerVisibility": {
        "barovia:gates-of-barovia-east": true
      }
    }
  },
  "users": {
    "uid123": {
      "username": "alice",
      "role": "player"
    },
    "uid999": {
      "username": "dm",
      "role": "admin"
    }
  }
}
```
