const { withStringsXml } = require("@expo/config-plugins");

module.exports = function withAndroidStrings(config) {
  return withStringsXml(config, (config) => {
    const strings = config.modResults;

    const customStrings = [
      {
        $: { name: "media_projection_notification_title" },
        _: "Battery Optimizer Active",
      },
      {
        $: { name: "media_projection_notification_text" },
        _: "Monitoring hardware performance...",
      },
      {
        $: { name: "ongoing_notification_channel_name" },
        _: "Battery Optimizer Notifications",
      },
    ];

    // Remove existing if any
    customStrings.forEach((customString) => {
      strings.resources.string = strings.resources.string.filter(
        (s) => s.$.name !== customString.$.name,
      );
      strings.resources.string.push(customString);
    });

    return config;
  });
};
