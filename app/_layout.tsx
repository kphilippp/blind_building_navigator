import "../global.css";
import { Stack, useRouter } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";
import { NavigationProvider } from "../contexts/NavigationContext";

function HeaderLeft() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push("/")}
      className="flex-row items-center ml-4"
      activeOpacity={0.7}
    >
      <Text className="text-2xl mr-2">📍</Text>
      <Text className="text-xl font-bold text-gray-900">JET2 NAV</Text>
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  return (
    <NavigationProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#ffffff",
            elevation: 0,
            shadowOpacity: 0,
          },
          headerLeft: () => <HeaderLeft />,
          headerTitle: "",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="navigate" />
        <Stack.Screen name="settings" />
      </Stack>
    </NavigationProvider>
  );
}
