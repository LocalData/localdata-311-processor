test:
	@envrun  --path -e test.env ./node_modules/.bin/mocha -iu tdd

.PHONY: test
