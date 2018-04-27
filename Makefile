SHELL:=/bin/bash

default: debug

all: default lint db

.PHONY: debug
debug: node_modules
	yarn build:web
	yarn build:server

.PHONY: release
release: node_modules
	yarn build:web:release
	yarn build:server

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

.PHONY: run-server-integration
run-server-integration: node_modules
	yarn start:server --db-name bot-test

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
		--names "jest,webpack,server"\
		--prefix-colors "bgYellow.bold,bgBlue.bold,bgGreen.bold"\
		"sleep 2 && yarn test:integration"\
		"make run-web"\
		"make run-server-integration"
