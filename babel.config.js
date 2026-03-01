module.exports = function (api) {
  // api.cache(true) tells Babel to cache the config for faster builds.
  // Use api.cache(false) during troubleshooting if changes aren't reflecting.
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
      // If you are using Reanimated, it must ALWAYS be the last plugin in this list.
      // 'react-native-reanimated/plugin',
    ],
  };
};
