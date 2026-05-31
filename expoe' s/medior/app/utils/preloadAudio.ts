import { Asset } from "expo-asset";

const audioAssets = [
  require("../../assets/audio/Whispers of the Serene Forest.mp3"),
  require("../../assets/audio/Whispers Beneath the Moonlight.mp3"),
  // Add more as needed
];

export async function preloadAllAudio() {
  try {
    console.log("Preloading audio assets...");

    const assetPromises = audioAssets.map((assetModule) => {
      const asset = Asset.fromModule(assetModule);
      return asset.downloadAsync();
    });

    await Promise.all(assetPromises);

    console.log("All audio assets preloaded successfully.");
  } catch (error) {
    console.error("Audio preloading failed:", error);
  }
}
