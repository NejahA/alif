import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, AppState, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import {
  checkAndUnlockAchievements,
  unlockSpecialAchievement,
} from "../utils/achievements";
import { addToRecent, isFavorite, toggleFavorite } from "../utils/favorites";
import { getSessionProgress, updateProgress } from "../utils/progressStorage";

// ── audio map ─────────────────────────────────────────────────
const sereneForestMp3 = require("../../assets/audio/Whispers of the Serene Forest.mp3");
const moonlightMp3 = require("../../assets/audio/Whispers Beneath the Moonlight.mp3");

// Loops
const windLoop = require("../../assets/audio/loops/wind.mp3");
const oceanLoop = require("../../assets/audio/loops/ocean.mp3");
const rainLoop = require("../../assets/audio/loops/rain.mp3");
const birdsLoop = require("../../assets/audio/loops/birds.mp3");
const forestLoop = require("../../assets/audio/loops/forest.mp3");
const gratitudeLoop = require("../../assets/audio/loops/bind.mp3"); // Using 'bind' as a substitute for gratitude

const audioMap: Record<string, any> = {
  sereneForest: sereneForestMp3,
  moonlight: moonlightMp3,
  deep_sleep: windLoop,
  ocean: oceanLoop,
  rainforest: rainLoop,
  mountain: birdsLoop,
  sunrise: forestLoop,
  gratitude: gratitudeLoop,
};

export default function PlayerScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const {
    title = "Meditation",
    audioKey = "",
    description = "",
  } = useLocalSearchParams<{
    title: string;
    audioKey: string;
    description: string;
  }>();

  // state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  // refs
  const appStateRef = useRef(AppState.currentState);
  const currentKeyRef = useRef(audioKey);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const calledRecentRef = useRef(false);

  // breathing
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const startBreathing = () => {
    animRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.6,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ]),
    );
    animRef.current.start();
  };
  const stopBreathing = () => {
    animRef.current?.stop();
    animRef.current = null;
    scaleAnim.setValue(1);
  };

  useEffect(() => {
    if (isPlaying) startBreathing();
    else stopBreathing();
    return stopBreathing;
  }, [isPlaying]);

  // check fav on mount
  useEffect(() => {
    (async () => {
      setIsFav(await isFavorite(audioKey));
    })();
  }, [audioKey]);

  // load audio
  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      if (sound && currentKeyRef.current !== audioKey) {
        const s = await sound.getStatusAsync();
        if (s.isLoaded && s.positionMillis > 0)
          await updateProgress(
            currentKeyRef.current,
            s.positionMillis / 1000,
            s.durationMillis ? s.durationMillis / 1000 : 0,
          );
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch { }
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        setSound(null);
        setIsPlaying(false);
        setStatus(null);
      }
      currentKeyRef.current = audioKey;
      if (!audioKey || !mounted) return;
      await loadAndPlay();
    };

    setup();

    return () => {
      mounted = false;
      if (sound) {
        (async () => {
          const s = await sound.getStatusAsync();
          if (s.isLoaded && s.positionMillis > 0)
            await updateProgress(
              audioKey,
              s.positionMillis / 1000,
              s.durationMillis ? s.durationMillis / 1000 : 0,
            );
          try {
            await sound.stopAsync();
            await sound.unloadAsync();
          } catch { }
          if (pollRef.current) clearInterval(pollRef.current);
        })();
      }
    };
  }, [audioKey]);

  async function loadAndPlay() {
    setIsLoading(true);
    const source = audioMap[audioKey];
    if (!source) {
      setIsLoading(false);
      return;
    }

    const saved = await getSessionProgress(audioKey);
    const startAt = saved?.position || 0;

    const { sound: newSound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      volume,
      positionMillis: Math.floor(startAt * 1000),
    });

    setSound(newSound);
    setIsPlaying(true);
    setIsLoading(false);

    // write to recent once
    if (!calledRecentRef.current) {
      calledRecentRef.current = true;
      addToRecent(audioKey, title, description);
    }

    pollRef.current = setInterval(async () => {
      setStatus(await newSound.getStatusAsync());
    }, 500);

    newSound.setOnPlaybackStatusUpdate((ps) => {
      setStatus(ps);
      if (ps.didJustFinish && ps.durationMillis) {
        setIsPlaying(false);
        updateProgress(
          audioKey,
          ps.durationMillis / 1000,
          ps.durationMillis / 1000,
        ).then(() => checkAndUnlockAchievements());
        const h = new Date().getHours();
        if (h < 7) unlockSpecialAchievement("early_bird");
        if (h >= 22) unlockSpecialAchievement("night_owl");
      }
    });
  }

  // controls
  async function togglePlay() {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
      const s = await sound.getStatusAsync();
      if (s.isLoaded && s.positionMillis > 0)
        await updateProgress(
          audioKey,
          s.positionMillis / 1000,
          s.durationMillis ? s.durationMillis / 1000 : 0,
        );
    } else {
      await sound.playAsync();
    }
    setIsPlaying(!isPlaying);
  }

  async function stopReset() {
    if (!sound) return;
    const s = await sound.getStatusAsync();
    if (s.isLoaded && s.positionMillis > 0)
      await updateProgress(
        audioKey,
        s.positionMillis / 1000,
        s.durationMillis ? s.durationMillis / 1000 : 0,
      );
    await sound.stopAsync();
    await sound.setPositionAsync(0);
    setIsPlaying(false);
  }

  async function seekTo(value: number) {
    if (!sound) return;
    await sound.setPositionAsync(Math.floor(value * 1000));
    const s = await sound.getStatusAsync();
    if (s.isLoaded)
      await updateProgress(
        audioKey,
        value,
        s.durationMillis ? s.durationMillis / 1000 : 0,
      );
  }

  async function changeVolume(v: number) {
    setVolume(v);
    if (sound) await sound.setVolumeAsync(v);
  }

  const handleFav = async () => {
    setIsFav(await toggleFavorite(audioKey, title));
  };

  // background pause
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (
        appStateRef.current === "active" &&
        next.match(/inactive|background/) &&
        isPlaying &&
        sound
      ) {
        sound.pauseAsync();
        setIsPlaying(false);
        sound.getStatusAsync().then((s) => {
          if (s.isLoaded && s.positionMillis > 0)
            updateProgress(
              audioKey,
              s.positionMillis / 1000,
              s.durationMillis ? s.durationMillis / 1000 : 0,
            );
        });
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [sound, isPlaying, audioKey]);

  const posSec = status?.positionMillis ? status.positionMillis / 1000 : 0;
  const durSec = status?.durationMillis ? status.durationMillis / 1000 : 0;
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <View
      className="flex-1 px-8 pt-12"
      style={{ backgroundColor: colors.background }}
    >
      {/* top row: back ←  …  ♡ */}
      <View className="flex-row justify-between items-center">
        <TouchableOpacity
          onPress={async () => {
            if (sound) {
              const s = await sound.getStatusAsync();
              if (s.isLoaded && s.positionMillis > 0)
                await updateProgress(
                  audioKey,
                  s.positionMillis / 1000,
                  s.durationMillis ? s.durationMillis / 1000 : 0,
                );
              await sound.stopAsync();
              await sound.unloadAsync();
            }
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={30} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleFav}>
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={26}
            color={isFav ? "#EF4444" : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* centered content */}
      <View className="flex-1 items-center justify-center">
        <Text
          className="text-3xl font-bold text-center mb-2"
          style={{ color: colors.text }}
        >
          {title}
        </Text>
        {description ? (
          <Text
            className="text-base text-center mb-6"
            style={{ color: colors.textSecondary }}
          >
            {description}
          </Text>
        ) : null}

        {/* breathing */}
        <View className="relative w-64 h-64 mb-12 items-center justify-center">
          <Animated.View
            className="absolute w-64 h-64 rounded-full"
            style={{
              backgroundColor: `${colors.primary}20`,
              transform: [{ scale: scaleAnim }],
            }}
          />
          <Animated.View
            className="absolute w-48 h-48 rounded-full"
            style={{
              backgroundColor: `${colors.primary}30`,
              transform: [{ scale: scaleAnim }],
            }}
          />
          <Text
            className="text-2xl font-medium z-10"
            style={{ color: colors.text }}
          >
            {isLoading ? "Loading…" : "Breathe"}
          </Text>
        </View>

        {/* seek */}
        <View className="w-full mb-10">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {fmt(posSec)}
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {fmt(durSec)}
            </Text>
          </View>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={durSec || 1}
            value={posSec}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
            onSlidingComplete={seekTo}
            disabled={!status?.isLoaded || durSec === 0 || isLoading}
          />
        </View>

        {/* stop + play */}
        <View className="flex-row items-center justify-center gap-12 mb-10">
          <TouchableOpacity
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.surface }}
            onPress={stopReset}
            disabled={isLoading}
          >
            <Ionicons name="stop" size={30} style={{ color: colors.text }} />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-24 h-24 rounded-full items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.primary }}
            onPress={togglePlay}
            disabled={isLoading}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={48}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* volume */}
        <View className="w-full mb-4">
          <Text
            className="text-center text-base mb-2"
            style={{ color: colors.textSecondary }}
          >
            Volume
          </Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
            onValueChange={changeVolume}
          />
        </View>

        <Text className="text-base" style={{ color: colors.textSecondary }}>
          {isLoading ? "Loading…" : isPlaying ? "Playing" : "Paused"}
        </Text>
      </View>
    </View>
  );
}
