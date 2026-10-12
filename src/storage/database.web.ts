let database: Promise<IDBDatabase> | undefined;

function getDatabase(): Promise<IDBDatabase> {
  if (!database) {
    database = new Promise<IDBDatabase>((resolve, reject) => {
      // Keep the original storage name so rebranding preserves existing savings.
      const request = indexedDB.open("tapi", 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains("savings")) request.result.createObjectStore("savings");
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); database = undefined; };
        resolve(db);
      };
      request.onerror = () => reject(request.error ?? new Error("Cannot open local database"));
    }).catch((error) => { database = undefined; throw error; });
  }
  return database;
}

export async function readSavings(): Promise<string | null> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("savings", "readonly");
    const request = transaction.objectStore("savings").get("current");
    transaction.oncomplete = () => {
      if (request.result === undefined) resolve(null);
      else if (typeof request.result === "string") resolve(request.result);
      else reject(new Error("Invalid savings data"));
    };
    transaction.onabort = () => reject(transaction.error ?? new Error("Cannot read local database"));
    transaction.onerror = () => reject(transaction.error ?? new Error("Cannot read local database"));
  });
}

export async function writeSavings(data: string): Promise<void> {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("savings", "readwrite");
    transaction.objectStore("savings").put(data, "current");
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("Cannot save local database"));
    transaction.onerror = () => reject(transaction.error ?? new Error("Cannot save local database"));
  });
}
