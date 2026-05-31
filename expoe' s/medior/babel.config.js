module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // If you later use Reanimated animations, add the plugin here (last in array):
    plugins: ['react-native-reanimated/plugin'],
  };
};
