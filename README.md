# DND-CoS-Map

Run the map locally:

```powershell
python sync_server.py
```

Then open:

- Player view: `http://127.0.0.1:8000/index.html`
- DM view: `http://127.0.0.1:8000/dm.html`

## Authentication And Campaigns

The site uses Firebase Authentication and Realtime Database.

- Users keep their existing username and password.
- After signing in, users see a list of campaigns they belong to.
- Existing users are automatically added to the default campaign `施特拉德的诅咒`.
- Admin accounts are DMs of the default campaign and can create additional campaigns.
- A DM can add an existing player account to a managed campaign by username.
- Map visibility, custom markers, and the player directory are isolated per campaign.

Usernames use `a-z`, `0-9`, `.`, `_`, and `-`, with a length of `3-24`.

## Firebase Setup

1. Enable `Authentication -> Sign-in method -> Email/Password`.
2. Publish [firebase-database.rules.json](d:/Projects/DND_CoS_Map/DND-CoS-Map/firebase-database.rules.json).
3. Existing admin accounts must keep `"role": "admin"` under `users/<uid>`.
4. Move existing map data from `maps/barovia` to `campaigns/curse-of-strahd/maps/barovia`.
5. Existing users only need to sign in once to receive their default campaign membership and username-directory entry.

The default campaign metadata is created automatically when an admin signs in. It can also be created manually:

```json
{
  "campaigns": {
    "curse-of-strahd": {
      "name": "施特拉德的诅咒",
      "ownerUid": "DM_USER_UID",
      "createdAt": "2026-06-05T00:00:00.000Z"
    }
  }
}
```

### Realtime Database Structure

```json
{
  "campaigns": {
    "curse-of-strahd": {
      "name": "施特拉德的诅咒",
      "ownerUid": "dmUid",
      "maps": {
        "barovia": {
          "markerVisibility": {
            "barovia:gates-of-barovia-east": true
          }
        }
      }
    }
  },
  "userCampaigns": {
    "playerUid": {
      "curse-of-strahd": {
        "name": "施特拉德的诅咒",
        "role": "player"
      }
    },
    "dmUid": {
      "curse-of-strahd": {
        "name": "施特拉德的诅咒",
        "role": "dm"
      }
    }
  },
  "usernameDirectory": {
    "alice": "playerUid"
  }
}
```
