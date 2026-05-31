import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { colors, activeTheme } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View
            className="absolute bottom-0 left-0 right-0"
            style={{
                backgroundColor: activeTheme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                paddingBottom: insets.bottom + 12, // More bottom padding for floating feel
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: activeTheme === 'dark' ? '#334155' : '#E5E7EB',
            }}
        >
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    gap: 12, // Spacing between items
                    alignItems: 'center'
                }}
            >
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];

                    // Skip if tabBarButton is hidden (usually how href:null works in expo-router but we might need explicit check)
                    // Actually expo-router filters href:null before passing here? Let's assume we want to SHOW all provided screens if user asked "All screens".
                    // But 'player' and 'sessions' might not be main tabs. User said "every screen ... bottom bar".
                    // I will filter out obvious internal screens like 'player'/sessions if they don't have a title or icon specifically set for tab.
                    // I'll rely on our explicit config in _layout.tsx. I need to UN-hide them there first.

                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: "tabLongPress",
                            target: route.key,
                        });
                    };

                    // Map route names to icons if not provided in options (fallback)
                    let iconName: any = "square";
                    if (route.name === "index") iconName = isFocused ? "home" : "home-outline";
                    else if (route.name === "collections-screen") iconName = isFocused ? "library" : "library-outline";
                    else if (route.name === "mood-tracker") iconName = isFocused ? "heart" : "heart-outline";
                    else if (route.name === "stats") iconName = isFocused ? "stats-chart" : "stats-chart-outline";
                    else if (route.name === "achievements-screen") iconName = isFocused ? "trophy" : "trophy-outline";
                    else if (route.name === "settings") iconName = isFocused ? "settings" : "settings-outline";
                    else if (route.name === "journal-screen") iconName = isFocused ? "book" : "book-outline";

                    // Use provided icon if available
                    const IconComponent = options.tabBarIcon
                        ? (props: any) => options.tabBarIcon?.({ focused: isFocused, color: isFocused ? colors.primary : colors.textSecondary, size: 24 })
                        : () => <Ionicons name={iconName} size={24} color={isFocused ? colors.primary : colors.textSecondary} />;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={(options as any).tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            className={`items-center justify-center rounded-2xl p-3 ${isFocused ? 'bg-primary/10' : 'bg-transparent'}`}
                            style={{ minWidth: 64 }}
                        >
                            <View className="mb-1">
                                {/* Invoke the icon function properly */}
                                {options.tabBarIcon
                                    ? options.tabBarIcon({ focused: isFocused, color: isFocused ? colors.primary : colors.textSecondary, size: 24 })
                                    : <Ionicons name={iconName} size={24} color={isFocused ? colors.primary : colors.textSecondary} />
                                }
                            </View>
                            {/* Optional: Show label if user wants. "icon ... in bottom bar" might mean ONLY icon. 
                  But scrollable bars usually have labels. Use strict "icon" request? 
                  "every screen to have a corresponding icon". 
                  Let's include text but small.
              */}
                            <Text
                                className={`text-[10px] font-bold ${isFocused ? 'text-primary' : 'text-text-secondary'}`}
                                numberOfLines={1}
                            >
                                {label as string}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
