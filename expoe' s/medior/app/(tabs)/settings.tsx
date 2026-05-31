import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

export default function SettingsScreen() {
  const { colors, activeTheme, setTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    darkMode: "auto" as "light" | "dark" | "auto",
    soundEnabled: true,
    vibrationEnabled: true,
    autoPlayNext: false,
  });

  const [dataSummary, setDataSummary] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Basic settings load logic could be here
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'darkMode') {
      setTheme(value);
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to delete all your meditation history? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything", style: "destructive", onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert("Success", "All progress has been reset.");
            router.replace('/');
          }
        }
      ]
    );
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="mb-8">
      <Text className="px-6 mb-3 text-sm font-bold text-text-secondary uppercase tracking-widest">{title}</Text>
      <View className="bg-card-light dark:bg-card-dark border-y border-gray-100 dark:border-gray-800">
        {children}
      </View>
    </View>
  );

  const SettingRow = ({ icon, label, value, onPress, rightElement, isLast }: any) => (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      className={`flex-row items-center ml-6 py-4 pr-6 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
    >
      <View className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 items-center justify-center mr-4">
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text className="flex-1 text-base font-medium text-text-primary dark:text-gray-100">{label}</Text>

      {rightElement ? (
        rightElement
      ) : (
        <View className="flex-row items-center">
          {value && <Text className="text-sm text-text-secondary mr-2">{value}</Text>}
          {onPress && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="px-6 py-4 flex-row items-center border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary dark:text-white">Settings</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Appearance */}
          <Section title="Appearance">
            <SettingRow
              icon="moon-outline" label="Dark Mode"
              rightElement={
                <View className="flex-row bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  {['light', 'dark', 'auto'].map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => updateSetting('darkMode', m)}
                      className={`px-3 py-1.5 rounded-lg ${settings.darkMode === m ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                    >
                      <Text className={`text-xs font-bold capitalize ${settings.darkMode === m ? 'text-primary' : 'text-text-secondary'}`}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              }
            />
          </Section>

          {/* Notifications */}
          <Section title="Notifications">
            <SettingRow
              icon="notifications-outline" label="Daily Reminders"
              isLast
              rightElement={
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={v => updateSetting('notificationsEnabled', v)}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={settings.notificationsEnabled ? colors.primary : '#f4f3f4'}
                />
              }
            />
          </Section>

          {/* Audio */}
          <Section title="Audio & Playback">
            <SettingRow
              icon="volume-high-outline" label="Sound Enabled"
              rightElement={
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={v => updateSetting('soundEnabled', v)}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={settings.soundEnabled ? colors.primary : '#f4f3f4'}
                />
              }
            />
            <SettingRow
              icon="phone-portrait-outline" label="Vibration"
              rightElement={
                <Switch
                  value={settings.vibrationEnabled}
                  onValueChange={v => updateSetting('vibrationEnabled', v)}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={settings.vibrationEnabled ? colors.primary : '#f4f3f4'}
                />
              }
            />
            <SettingRow
              icon="play-skip-forward-outline" label="Auto-play Next"
              isLast
              rightElement={
                <Switch
                  value={settings.autoPlayNext}
                  onValueChange={v => updateSetting('autoPlayNext', v)}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={settings.autoPlayNext ? colors.primary : '#f4f3f4'}
                />
              }
            />
          </Section>

          {/* About */}
          <Section title="About">
            <SettingRow icon="information-circle-outline" label="App Version" value="1.0.0" />
            <SettingRow icon="document-text-outline" label="Privacy Policy" onPress={() => Alert.alert('Privacy Policy', 'Consult our website.')} />
            <SettingRow icon="shield-checkmark-outline" label="Terms of Service" onPress={() => Alert.alert('Terms', 'Consult our website.')} isLast />
          </Section>

          {/* Danger zone */}
          <View className="px-6 pb-6 mt-4">
            <TouchableOpacity
              className="flex-row items-center justify-center p-5 rounded-[24px] bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20"
              onPress={handleResetProgress}
            >
              <Ionicons name="trash-outline" size={22} color={colors.error} />
              <Text className="ml-3 font-bold text-lg text-red-600 dark:text-red-400">Reset All Progress</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-center text-[10px] text-text-secondary/40 pb-10 px-10 uppercase tracking-widest font-semibold">
            Made with 💜 for your mindfulness journey
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
