import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

let database: Promise<SQLiteDatabase> | undefined;

function getDatabase() {
  if (!database) {
    database = (async () => {
      // Keep the original storage name so rebranding preserves existing savings.
      const db = await openDatabaseAsync("tapi.db");
      try {
        const version = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
        if ((version?.user_version ?? 0) > 1) throw new Error("Database requires a newer app version");
        await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL;");
        await db.withExclusiveTransactionAsync(async (transaction) => {
          await transaction.execAsync(`
            CREATE TABLE IF NOT EXISTS savings (
              id INTEGER PRIMARY KEY CHECK (id = 1),
              data TEXT NOT NULL
            );
            PRAGMA user_version = 1;
          `);
        });
        return db;
      } catch (error) {
        await db.closeAsync();
        throw error;
      }
    })().catch((error) => {
      database = undefined;
      throw error;
    });
  }
  return database;
}

export async function readSavings(): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ data: string }>("SELECT data FROM savings WHERE id = 1");
  return row?.data ?? null;
}

export async function writeSavings(data: string): Promise<void> {
  const db = await getDatabase();
  // One atomic write keeps counts, history, profile and goals consistent.
  await db.runAsync(
    "INSERT INTO savings (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data",
    data,
  );
}
