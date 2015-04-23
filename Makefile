HOMEDIR = $(shell pwd)
GITDIR = /var/repos/sprigot-api.git
PM2 = pm2

test:
	node tests/store-tests.js
	# mocha -R spec tests/sprigtests.js

start:
	$(PM2) start app.js --name sprigot-api || echo "Process already started."

stop:
	$(PM2) stop sprigot-api || echo "Didn't need to stop process."

list:
	$(PM2) list

sync-worktree-to-git:
	git --work-tree=$(HOMEDIR) --git-dir=$(GITDIR) checkout -f

npm-install:
	cd $(HOMEDIR)
	npm install
	npm prune

post-receive: sync-worktree-to-git npm-install stop start
