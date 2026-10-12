# Local database

New installations show onboarding before Home. The chosen name, first goal and `onboardingComplete` flag are saved in one database write before setup is dismissed. Existing saved profiles without this flag are migrated as already onboarded, preserving their savings and goals. Practice coins during onboarding never affect the database.

The app is branded **tigom.**. Internal `tapi` database names and the legacy storage key are retained for compatibility with existing savings. The `tigom` URL scheme is primary; the `tapi` scheme is retained for existing links.

Android and iOS use `expo-sqlite` (already included in the dependencies and Expo config) to create `tapi.db` inside the installed app's private storage on first launch. No server, account, internet connection, or separately copied database file is required. The schema and initialization code ship with the app binary.

The browser version uses IndexedDB named `tapi`. It does not require SQLite WASM or special hosting headers. Browser storage belongs to that browser and site origin.

Coin counts, activity history, profile name, goals and the selected goal are saved together as one atomic snapshot. Writes are queued in order. SQLite uses WAL and FULL synchronization. Schema version 1 is recorded in `PRAGMA user_version`; newer unsupported schemas are rejected rather than overwritten.

On first database initialization, existing `tapi:savings:v1` AsyncStorage data is validated and migrated, including older single-goal data. The legacy copy is retained for recovery; subsequent reads and writes use the database. New installations start with zero coins and no sample history. Editing remains disabled if initialization fails.

Persistence survives closing/reopening the app and normal updates installed with the same application identity. Exporting/building the app packages the database code, not the developer's personal savings. Each new installation creates its own database. Uninstalling, clearing app data, or clearing browser storage can remove savings; transferring existing savings to another device would require a separate backup/import feature.

Build Android/iOS binaries with Expo/EAS so the configured `expo-sqlite` native module is included. A JavaScript/web export alone is not an Android or iOS installer. No generated `ios/` or `android/` files need manual edits.
