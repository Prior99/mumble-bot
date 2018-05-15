SHELL:=/bin/bash

default: debug

all: default lint db

.PHONY: build-server
build-server:
	yarn build:server

.PHONY: debug
debug: node_modules build-server
	yarn build:web

.PHONY: release
release: node_modules build-server
	yarn build:web:release

.PHONY: node_modules
node_modules:
	yarn

.PHONY: lint
lint: node_modules
	yarn lint:src
	yarn lint:style

.PHONY: test
test: node_modules
	yarn test

.PHONY: test-watch
test-watch: node_modules
	yarn test --watch

.PHONY: run-web
run-web: node_modules
	yarn start:web

.PHONY: run-server
run-server: node_modules db
	yarn start:server

.PHONY: run-worker
run-worker: node_modules db build-server
	yarn start:worker

.PHONY: test-integration
test-integration: 
	yarn test:integration

.PHONY: run-worker-integration
run-worker-integration: node_modules build-server
	yarn start:worker\
		--tmp-dir tmp/bot-test/tmp\
		--sounds-dir tmp/bot-test/sounds

.PHONY: run-server-integration
run-server-integration: node_modules build-server
	dropdb $${POSTGRES_DB:-bot-test} || true
	createdb $${POSTGRES_DB:-bot-test} || true
	rm -rf tmp/bot-test/tmp || true
	rm -rf tmp/bot-test/sounds || true
	node server serve\
		--url $${MUMBLE_URL:-localhost}\
		--name test-bot\
		--tmp-dir tmp/bot-test/tmp\
		--sounds-dir tmp/bot-test/sounds\
		--port 23278\
		--db-name $${POSTGRES_DB:-bot-test}\
		--db-username $${POSTGRES_USER:-$$USER}\
		--db-host $${POSTGRES_HOST:-localhost}\
		--db-password $${POSTGRES_PASSWORD:-""}

.PHONY: clean-db
clean-db:
	dropdb bot || true

.PHONY: clean
clean:
	rm -Rf node_modules/
	rm -Rf server/
	rm -f dist/bundle.js \
	  dist/bundle.js.map \
	  dist/bundle.css \
	  dist/bundle.css.map || true

.PHONY: db
db:
	createdb bot || true

.PHONY: integration-test
integration-test: node_modules
	yarn concurrently\
		--success first\
		--kill-others\
		--prefix " {name} "\
		--names "jest,webpack,worker,server"\
		--prefix-colors "yellow.bold,blue.bold,red.bold,green.bold"\
		"sleep 10 && make test-integration"\
		"make run-web"\
		"make run-worker-integration"\
		"make run-server-integration"
