var fs = require("fs");
var path = require("path");
var Config = require("../lib/config");

QUnit.module("Config");

test("Parsing an ESLint config file", function() {
  var config = new Config("{ \"rules\": { \"semi\": 2, }, }");

  deepEqual(
    config.parse(),
    {
      globals: {},
      env: {},
      rules: { semi: 2 },
      parserOptions: {},
    }
  );
});

test("Parsing an ESLint config file with airbnb's config", function() {
  var config = new Config("{ \"extends\": \"airbnb/base\", }");

  var configFile = path.join(__dirname, "fixtures", "airbnb-config.json");
  var expectedConfig = JSON.parse(fs.readFileSync(configFile, "utf8"));
  var parsedConfig = config.parse();
  deepEqual(
    parsedConfig.globals,
    expectedConfig.globals,
    "matching property `globals`"
  );
  deepEqual(
    parsedConfig.env,
    expectedConfig.env,
    "matching property `env`"
  );
  deepEqual(
    parsedConfig.rules,
    expectedConfig.rules,
    "matching property `rules`"
  );
  deepEqual(
    parsedConfig.parserOptions,
    expectedConfig.parserOptions,
    "matching property `parserOptions`"
  );
});

test("Determining a valid configuration file", function() {
  var config = new Config("{ \"rules\": { \"semi\": 2, }, }");

  equal(
    config.isValid(),
    true
  );
});

test("Determining an invalid configuration file", function() {
  var config = new Config("---\nyaml: is good\ntrue/false/syntax/error");

  equal(
    config.isValid(),
    false
  );
});
