var configFile = require("eslint/lib/config/config-file");
var fs = require("fs");
var rules = require("eslint/lib/rules");
var temp = require("temp").track();
var plugins = require("eslint/lib/config/plugins");

var whitelist = [
  "react",
  "standard",
];

function Config(rawConfig) {
  this.rawConfig = rawConfig;
};

Config.prototype.parse = function() {
  var config = this.rawConfig || "{}";
  var path = temp.path("eslintrc");
  fs.writeFileSync(path, config, "utf8");

  try {
    var configContent = configFile.load(path);
    this.loadPlugins(configContent.plugins);

    return configContent;
  } finally {
    temp.cleanup();
  }
};

Config.prototype.isValid = function() {
  try {
    this.parse();
    return true;
  } catch (exception) {
    return false;
  }
};

// Stolen, and modified, from:
// https://github.com/eslint/eslint/blob/72a325ca31be20f7a9695556cb5883cd4e9cce14/lib/cli-engine.js#L110-L136
Config.prototype.requirePlugin = function(pluginName) {
  var pluginNamespace = plugins.getNamespace(pluginName);
  var nameWithoutNamespace = plugins.removeNamespace(pluginName);
  var nameWithoutPrefix = plugins.removePrefix(nameWithoutNamespace);
  var pluginPrefix = "eslint-plugin-";

  if (whitelist.indexOf(nameWithoutPrefix) > -1) {
    var plugin = require(pluginNamespace + pluginPrefix + nameWithoutPrefix);
    // if this plugin has rules, import them
    if (plugin.rules) {
      rules.import(plugin.rules, nameWithoutPrefix);
    }
  }
};

Config.prototype.loadPlugins = function(pluginNames) {
  if (pluginNames) {
    pluginNames.forEach(this.requirePlugin);
  } else {
    return;
  }
};

module.exports = Config;
