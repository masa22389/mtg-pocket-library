# IndexedDB storage verification

Open tests/storage-browser.html through a local HTTP server and press the test button.
The test uses isolated databases, never the application's database. It verifies legacy migration,
large data above the former localStorage limit, reload, atomic writes, rollback, and retry after an
interrupted migration. Node regression tests cover card saving, purchase transfers, and deck versions.

The application starts only after IndexedDB migration commits. Existing mtg-pocket.* localStorage
values are retained as a migration-time recovery copy, not kept in sync. Never downgrade to an older
localStorage-based app and assume that copy reflects later edits. Export a current JSON backup to move
data to another installation. The normal backup/restore format is unchanged.

The UI's explicit Delete All action also removes the corresponding migration-time localStorage copies.
Scanner recognition data has its own IndexedDB database and is not migrated by this change.
