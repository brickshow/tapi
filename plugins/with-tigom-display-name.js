const { AndroidConfig, withStringsXml } = require("expo/config-plugins");

module.exports = function withTigomDisplayName(config) {
  return withStringsXml(config, (modConfig) => {
    modConfig.modResults = AndroidConfig.Strings.setStringItem(
      [{ $: { name: "app_name", translatable: "false" }, _: "tigom." }],
      modConfig.modResults,
    );
    return modConfig;
  });
};
