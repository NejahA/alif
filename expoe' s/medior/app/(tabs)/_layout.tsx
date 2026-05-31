import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomTabBar } from "../../components/CustomTabBar";
import { useTheme } from "../../contexts/ThemeContext";

export default function TabLayout() {
  const { colors, activeTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collections-screen"
        options={{
          title: "Collections",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "library" : "library-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mood-tracker"
        options={{
          title: "Check-In",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "heart" : "heart-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="daily-checkin"
        options={{
          title: "Daily Log",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics-advanced"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal-screen"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "book" : "book-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: "Timer",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "timer" : "timer-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="breathing-exercise"
        options={{
          title: "Breathing",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "leaf" : "leaf-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Sound mixer"
        options={{
          title: "Mixer",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "options" : "options-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sleep-timer"
        options={{
          title: "Sleep",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "moon" : "moon-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements-screen"
        options={{
          title: "Awards",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "trophy" : "trophy-outline"} size={size} color={color} />
          ),
        }}
      />


      {/* Internal utility screens - Now exposed as requested by user */}
      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessions",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "musical-notes" : "musical-notes-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="player" 
        options={{
          title: "Player",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "play-circle" : "play-circle-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="onboarding"
        options={{
          title: "Intro",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "rocket" : "rocket-outline"} size={size} color={color} />
          ),
        }}
      /> */}
    </Tabs>
  );
}
