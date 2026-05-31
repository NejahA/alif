import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "@theme_preference";

type Theme = "light" | "dark" | "auto";
type ActiveTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  activeTheme: ActiveTheme;
  setTheme: (theme: Theme) => void;
  colors: ColorScheme;
}

interface ColorScheme {
  // Backgrounds
  background: string;
  card: string;
  surface: string;

  // Text
  text: string;
  textSecondary: string;

  // Primary colors
  primary: string;
  primaryLight: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // UI Elements
  border: string;
  divider: string;
  placeholder: string;

  // Achievements
  achievementStreak: string;
  achievementTime: string;
  achievementSession: string;
  achievementSpecial: string;
}

const lightColors: ColorScheme = {
  background: "#F9FAFB",
  card: "#FFFFFF",
  surface: "#F3F4F6",

  text: "#1F2937",
  textSecondary: "#6B7280",

  primary: "#4F46E5",
  primaryLight: "#A5B4FC",

  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#06B6D4",

  border: "#E5E7EB",
  divider: "#F3F4F6",
  placeholder: "#9CA3AF",

  achievementStreak: "#F59E0B",
  achievementTime: "#8B5CF6",
  achievementSession: "#10B981",
  achievementSpecial: "#EC4899",
};

const darkColors: ColorScheme = {
  background: "#0F172A",
  card: "#1E293B",
  surface: "#334155",

  text: "#F1F5F9",
  textSecondary: "#94A3B8",

  primary: "#6366F1",
  primaryLight: "#818CF8",

  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  info: "#22D3EE",

  border: "#334155",
  divider: "#1E293B",
  placeholder: "#64748B",

  achievementStreak: "#FBBF24",
  achievementTime: "#A78BFA",
  achievementSession: "#34D399",
  achievementSpecial: "#F472B6",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("auto");
  const [activeTheme, setActiveTheme] = useState<ActiveTheme>(
    systemColorScheme === "dark" ? "dark" : "light",
  );

  // Load saved theme preference
  useEffect(() => {
    loadTheme();
  }, []);

  // Update active theme when preference or system theme changes
  useEffect(() => {
    if (theme === "auto") {
      setActiveTheme(systemColorScheme === "dark" ? "dark" : "light");
    } else {
      setActiveTheme(theme);
    }
  }, [theme, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (
        saved &&
        (saved === "light" || saved === "dark" || saved === "auto")
      ) {
        setThemeState(saved as Theme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const colors = activeTheme === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, activeTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// Helper function to get theme-aware styles
export function themed(
  lightStyle: any,
  darkStyle: any,
  activeTheme: ActiveTheme,
) {
  return activeTheme === "dark" ? darkStyle : lightStyle;
}
