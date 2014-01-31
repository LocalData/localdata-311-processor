test:
	@envrun --path -e test.env -- ./node_modules/.bin/mocha --ui tdd --reporter spec

.PHONY: test
