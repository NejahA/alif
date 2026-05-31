// utils/notificationUtils.ts
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const DAILY_REMINDER_IDENTIFIER = "daily-meditation-reminder";

export interface NotificationSettings {
  enabled: boolean;
  hour: number; // 0–23
  minute: number; // 0–59
}

/**
 * Requests notification permissions (local notifications only in this case)
 */
export async function registerForLocalNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4F46E5",
    });
  }

  if (!Device.isDevice) {
    console.log("Must use physical device for notifications");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

/**
 * Cancels the daily meditation reminder if it exists
 */
export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      DAILY_REMINDER_IDENTIFIER,
    );
    console.log("Daily reminder cancelled");
  } catch (error) {
    // No notification existed or other error — safe to ignore
    console.log("Cancel daily reminder:", error);
  }
}

/**
 * Schedules (or reschedules) the daily meditation reminder
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
): Promise<void> {
  try {
    // Always clear previous schedule first
    await cancelDailyReminder();

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_IDENTIFIER,
      content: {
        title: "Time for your daily meditation",
        body: "Build your streak — even 5 minutes can make a difference.",
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { screen: "sessions" },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    console.log(
      `Daily reminder scheduled at ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    );
  } catch (error) {
    console.error("Failed to schedule daily reminder:", error);
  }
}

/**
 * Syncs the current app settings with the notification schedule
 */
export async function syncNotificationsWithSettings(
  enabled: boolean,
  reminderTime: string, // format "HH:mm"
): Promise<void> {
  if (!enabled) {
    await cancelDailyReminder();
    return;
  }

  const [hourStr, minuteStr] = reminderTime.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (
    isNaN(hour) ||
    isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    console.warn("Invalid reminder time format:", reminderTime);
    return;
  }

  await scheduleDailyReminder(hour, minute);
}
