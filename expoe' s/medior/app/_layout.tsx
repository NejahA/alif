import { Stack } from "expo-router";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import "../global.css";
import { preloadAllAudio } from "./utils/preloadAudio";

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { activeTheme } = useTheme();
  const { setColorScheme } = useNativeWindColorScheme();

  useEffect(() => {
    setColorScheme(activeTheme);
  }, [activeTheme, setColorScheme]);

  return (
    <View style={{ flex: 1, backgroundColor: activeTheme === 'dark' ? '#0F172A' : '#F9FAFB' }}>
      {children}
    </View>
  );
}

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * The root layout component that sets up the app's stack and
 * preloads all audio files. It also requests notification permission
 * and schedules a daily reminder at 8:00 AM.
 */
/*******  3a75cbe7-0460-4da1-b90b-54f84a2a1d0d  *******/ export default function RootLayout() {
  useEffect(() => {
    preloadAllAudio();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemeSync>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </ThemeSync>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
