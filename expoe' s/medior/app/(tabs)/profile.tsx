import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from 'expo-image-picker';
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { getProfile, saveProfile, UserProfile } from "../utils/profileStorage";
import { getProgress } from "../utils/progressStorage";

export default function ProfileScreen() {
  const { colors, activeTheme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Alex Johnson",
    avatar: "https://i.pravatar.cc/300"
  });
  const [stats, setStats] = useState([
    { label: "Total Sessions", value: "0" },
    { label: "Minutes Meditated", value: "0" },
    { label: "Current Streak", value: "0 Days" },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userProfile, progress] = await Promise.all([
        getProfile(),
        getProgress()
      ]);

      setProfile(userProfile);
      setTempName(userProfile.name);

      setStats([
        { label: "Total Sessions", value: progress.totalSessions.toString() },
        { label: "Minutes Meditated", value: progress.totalMinutes.toString() },
        { label: "Current Streak", value: `${progress.streak} Days` },
      ]);
      setLoading(false);
    } catch (err) {
      console.error("Error loading profile data", err);
      setLoading(false);
    }
  };

  const getLevel = (minutes: number) => {
    if (minutes >= 1000) return "Zen Master";
    if (minutes >= 500) return "Mindfulness Expert";
    if (minutes >= 100) return "Mindfulness Seeker";
    return "Beginner Meditator";
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      await saveProfile({ name: tempName.trim() });
      setProfile(prev => ({ ...prev, name: tempName.trim() }));
      setIsEditing(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await saveProfile({ avatar: uri });
      setProfile(prev => ({ ...prev, avatar: uri }));
    }
  };

  const currentLevel = getLevel(parseInt(stats[1].value) || 0);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>

          {/* Header / Profile Card */}
          <View className="items-center py-8 px-6 bg-card-light dark:bg-card-dark mb-6 border-b border-gray-100 dark:border-gray-800 rounded-b-[32px] shadow-sm">
            <TouchableOpacity
              onPress={pickImage}
              className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4 border-4 border-primary/10 overflow-hidden relative shadow-lg shadow-primary/20"
            >
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} className="w-full h-full" />
              ) : (
                <Ionicons name="person" size={48} color={colors.primary} />
              )}
              <View className="absolute bottom-0 right-0 left-0 bg-black/40 py-1 items-center">
                <Ionicons name="camera" size={12} color="white" />
              </View>
            </TouchableOpacity>

            {isEditing ? (
              <View className="flex-row items-center w-full px-10 mb-2">
                <TextInput
                  value={tempName}
                  onChangeText={setTempName}
                  className="flex-1 text-2xl font-bold text-text-primary dark:text-gray-50 border-b-2 border-primary py-1"
                  autoFocus
                  onBlur={handleSaveName}
                  onSubmitEditing={handleSaveName}
                />
                <TouchableOpacity onPress={handleSaveName} className="ml-2">
                  <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(true)} className="flex-row items-center mb-1">
                <Text className="text-2xl font-bold text-text-primary dark:text-gray-50 mr-2">{profile.name}</Text>
                <Ionicons name="pencil-outline" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}

            <Text className="text-sm text-primary font-medium">{currentLevel}</Text>
            <Text className="text-xs text-text-secondary mt-1">Meditation Journey</Text>
          </View>

          {/* Stats Overview */}
          <View className="px-6 mb-8">
            <Text className="text-lg font-bold text-text-primary dark:text-gray-100 mb-4 px-2">Overview</Text>
            <View className="flex-row flex-wrap gap-4">
              {stats.map((stat, i) => (
                <View key={i} className="flex-1 min-w-[100px] p-4 rounded-2xl bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm items-center">
                  <Text className="text-xl font-bold text-primary mb-1">{stat.value}</Text>
                  <Text className="text-xs text-text-secondary text-center">{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Menu Options */}
          <View className="px-6 gap-3">
            <Link href="/settings" asChild>
              <TouchableOpacity className="flex-row items-center p-4 rounded-2xl bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800">
                <View className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4">
                  <Ionicons name="settings-outline" size={22} color={colors.text} />
                </View>
                <Text className="flex-1 text-base font-semibold text-text-primary dark:text-gray-100">Settings</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </Link>

            <Link href="/achievements-screen" asChild>
              <TouchableOpacity className="flex-row items-center p-4 rounded-2xl bg-card-light dark:bg-card-dark border border-gray-100 dark:border-gray-800">
                <View className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 items-center justify-center mr-4">
                  <Ionicons name="trophy-outline" size={22} color="#F59E0B" />
                </View>
                <Text className="flex-1 text-base font-semibold text-text-primary dark:text-gray-100">Achievements</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
