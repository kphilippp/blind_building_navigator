import "../global.css";
import { Stack, useRouter } from "expo-router";
import { Text, TouchableOpacity, Image, View } from "react-native";
import { NavigationProvider, useNavigation } from "../contexts/NavigationContext";

function HeaderTitle() {
  const router = useRouter();
  const { resetNavigation } = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        resetNavigation();
        router.replace("/");
      }}
      activeOpacity={0.8}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 8,
          paddingHorizontal: 4,
        }}
      >
        <Image
          source={require("../assets/logo.png")}
          style={{ width: 32, height: 32, tintColor: "#FFFFFF", marginRight: 8 }}
          resizeMode="contain"
        />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: "700",
            letterSpacing: 0.5,
          }}
        >
          JET2 NAV
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  return (
    <NavigationProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0D5A94",
          },
          headerTintColor: "#FFFFFF",
          headerTitleAlign: "left",
          headerTitleContainerStyle: { alignItems: "flex-start" },
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null,
          headerTitle: () => <HeaderTitle />,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="navigate" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="guidance" />
      </Stack>
    </NavigationProvider>
  );
}
