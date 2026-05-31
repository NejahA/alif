import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_NAME_KEY = "@user_profile_name";
const PROFILE_BIO_KEY = "@user_profile_bio";
const PROFILE_AVATAR_KEY = "@user_profile_avatar";

export interface UserProfile {
  name: string;
  bio?: string;
  avatar?: string;
}

export async function getProfile(): Promise<UserProfile> {
  try {
    const [name, bio, avatar] = await Promise.all([
      AsyncStorage.getItem(PROFILE_NAME_KEY),
      AsyncStorage.getItem(PROFILE_BIO_KEY),
      AsyncStorage.getItem(PROFILE_AVATAR_KEY),
    ]);

    return {
      name: name || "Alex Johnson",
      bio: bio || "Mindfulness Seeker",
      avatar: avatar || "https://i.pravatar.cc/300",
    };
  } catch (error) {
    console.error("Error reading profile:", error);
    return { name: "Alex Johnson" };
  }
}

export async function saveProfile(profile: Partial<UserProfile>): Promise<void> {
  try {
    const promises = [];
    if (profile.name !== undefined) promises.push(AsyncStorage.setItem(PROFILE_NAME_KEY, profile.name));
    if (profile.bio !== undefined) promises.push(AsyncStorage.setItem(PROFILE_BIO_KEY, profile.bio));
    if (profile.avatar !== undefined) promises.push(AsyncStorage.setItem(PROFILE_AVATAR_KEY, profile.avatar));

    await Promise.all(promises);
  } catch (error) {
    console.error("Error saving profile:", error);
  }
}
