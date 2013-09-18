#!/bin/sh

NOW=$(date +"%Y-%m-%d_%H:%M:%S")
scp -r noderunner@192.241.250.38:/var/www/sprigot/db/sprigot.db .
BACKUP_FILE="sprigotdb_$NOW.tgz"
echo $BACKUP_FILE
tar cvzf $BACKUP_FILE sprigot.db
mv $BACKUP_FILE ~/Dropbox/sprigot_db_backups/
