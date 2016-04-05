REPORTER = spec

BASE = .

AUTO-ISTANBUL = ./node_modules/.bin/auto-istanbul
JSHINT = ./node_modules/.bin/jshint
COVERAGE_OPTS = #--lines 95 --statements 90 --branches 80 --functions 90

main: lint test

cover:
	$(AUTO-ISTANBUL) cover

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER)

lint:
	$(JSHINT) ./lib --config $(BASE)/.jshintrc && \
	$(JSHINT) ./test --config $(BASE)/.jshintrc

# Sends the documentation to gh-pages.
publish.report:
	$(AUTO-ISTANBUL) publish-report

cover.deploy: cover publish.report

.PHONY: test docs