import { View, Text, Switch } from "react-native";
import { useState } from "react";

export default function SettingsPage() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-4">
        <View className="bg-purple-50 p-4 rounded-lg mb-4">
          <Text className="text-lg text-purple-900 font-semibold mb-2">
            Accessibility Settings
          </Text>
          <Text className="text-purple-700">
            Customize your navigation experience.
          </Text>
        </View>

        <View className="bg-white border border-gray-200 rounded-lg">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <View>
              <Text className="text-gray-900 font-semibold">Voice Guidance</Text>
              <Text className="text-gray-600 text-sm">
                Enable audio navigation instructions
              </Text>
            </View>
            <Switch value={voiceEnabled} onValueChange={setVoiceEnabled} />
          </View>

          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <View>
              <Text className="text-gray-900 font-semibold">Haptic Feedback</Text>
              <Text className="text-gray-600 text-sm">
                Vibration alerts for navigation
              </Text>
            </View>
            <Switch value={hapticEnabled} onValueChange={setHapticEnabled} />
          </View>

          <View className="flex-row justify-between items-center p-4">
            <View>
              <Text className="text-gray-900 font-semibold">App Version</Text>
              <Text className="text-gray-600 text-sm">1.0.0</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
