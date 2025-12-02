import "./global.css";
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-blue-600">
        Welcome to Expo + Tailwind!
      </Text>
      <Text className="text-lg text-gray-600 mt-4">
        NativeWind is working correctly
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
