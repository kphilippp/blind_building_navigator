import "../global.css";
import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerLeft: () => (
          <View className="flex-row items-center ml-4">
            <Text className="text-2xl mr-2">📍</Text>
            <Text className="text-xl font-bold text-gray-900">JET2 NAV</Text>
          </View>
        ),
        headerTitle: "",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="navigate" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
