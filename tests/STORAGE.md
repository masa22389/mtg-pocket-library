# IndexedDB storage verification

Open tests/storage-browser.html through a local HTTP server and press the test button.
The test uses isolated databases, never the application's database. It verifies legacy migration,
large data above the former localStorage limit, reload, atomic writes, rollback, and retry after an
interrupted migration. Node regression tests cover card saving, purchase transfers, and deck versions.

The application starts only after IndexedDB migration commits. Existing mtg-pocket.* localStorage
values are retained as a migration-time recovery copy, not kept in sync. Never downgrade to an older
localStorage-based app and assume that copy reflects later edits. Export a current JSON backup to move
data to another installation. The normal backup/restore format is unchanged.

Since v333 a data write (`writeBatch`) first compares each key with the value this screen last read.
If another screen (the scanner frame, another tab or window) saved the key in between, the whole batch
is aborted instead of overwriting that data, the newer value is loaded into the cache, and the app
reloads the affected data and saves its remaining fields. Single preferences (`setItem`), backup
restore and Delete All are intentionally last-write-wins (`{force: true}`). A conflict is not treated
as a storage failure and does not block later writes. The scanner's `scanner/shared-storage.js` copy
only uses the migration part and is unchanged.

Since v334 the app asks the browser for persistent storage (`navigator.storage.persist()`) after the
database opens, so Chrome does not evict the data when the device runs low on space. The browser may
grant or deny this silently; a denial changes nothing else. Clearing site data by the user still
deletes everything, so JSON backups remain necessary.

Since v342 a single failed write (for example quota exceeded) no longer blocks later writes. The cache keeps
the last saved value, so the next save writes the unsaved change again, and a successful save clears the error
banner. Only an unusable connection (closed by an upgrade in another screen) stops all writes until reload.
The app also skips fields whose saved text is unchanged, so most saves write one key instead of all of them.

The UI's explicit Delete All action also removes the corresponding migration-time localStorage copies.
Scanner recognition data has its own IndexedDB database and is not migrated by this change.
