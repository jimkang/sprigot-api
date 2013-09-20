#!/bin/sh

ssh noderunner@192.241.250.38 'rm -rf /var/www/sprigot/db/sprigot.db.replaced'
ssh noderunner@192.241.250.38 'mv /var/www/sprigot/db/sprigot.db /var/www/sprigot/db/sprigot.db.replaced'
scp -r ../db/sprigot.db noderunner@192.241.250.38:/var/www/sprigot/db/sprigot.db
