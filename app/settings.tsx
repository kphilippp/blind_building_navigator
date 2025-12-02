import { View, Text, Switch, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "../contexts/NavigationContext";
import { speechService } from "../services/speechService";

export default function SettingsPage() {
  const { state, updateSettings } = useNavigation();

  const handleVoiceToggle = async (value: boolean) => {
    updateSettings({ voiceGuidanceEnabled: value });

    if (value) {
      await speechService.speak("Voice guidance enabled");
    }
  };

  const handleHapticToggle = (value: boolean) => {
    updateSettings({ hapticFeedbackEnabled: value });
  };

  const testVoiceGuidance = async () => {
    if (state.settings.voiceGuidanceEnabled) {
      await speechService.speak(
        "This is a test of the voice guidance system. Navigation instructions will be announced as you navigate."
      );
    } else {
      Alert.alert("Voice Guidance Disabled", "Please enable voice guidance to test.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-4">
        <View style={{ backgroundColor: "#E8F4FC" }} className="p-4 rounded-lg mb-4">
          <Text style={{ color: "#1A75BB" }} className="text-lg font-semibold mb-2">
            Accessibility Settings
          </Text>
          <Text style={{ color: "#0D5A94" }}>
            Customize your navigation experience for optimal accessibility.
          </Text>
        </View>

        <View className="bg-white border border-gray-200 rounded-lg mb-4">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold">Voice Guidance</Text>
              <Text className="text-gray-600 text-sm">
                Enable audio navigation instructions
              </Text>
            </View>
            <Switch
              value={state.settings.voiceGuidanceEnabled}
              onValueChange={handleVoiceToggle}
              trackColor={{ false: "#D1D5DB", true: "#B8DAEF" }}
              thumbColor={state.settings.voiceGuidanceEnabled ? "#1A75BB" : "#F3F4F6"}
            />
          </View>

          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold">Haptic Feedback</Text>
              <Text className="text-gray-600 text-sm">
                Vibration alerts for navigation updates
              </Text>
            </View>
            <Switch
              value={state.settings.hapticFeedbackEnabled}
              onValueChange={handleHapticToggle}
              trackColor={{ false: "#D1D5DB", true: "#B8DAEF" }}
              thumbColor={state.settings.hapticFeedbackEnabled ? "#1A75BB" : "#F3F4F6"}
            />
          </View>

          <TouchableOpacity
            className="p-4 border-b border-gray-200"
            onPress={testVoiceGuidance}
          >
            <Text style={{ color: "#1A75BB" }} className="font-semibold">Test Voice Guidance</Text>
            <Text className="text-gray-600 text-sm">
              Play a sample navigation instruction
            </Text>
          </TouchableOpacity>

          <View className="p-4">
            <Text className="text-gray-900 font-semibold">App Version</Text>
            <Text className="text-gray-600 text-sm">1.0.0 - JET2 NAV</Text>
          </View>
        </View>

        <View style={{ backgroundColor: "#E8F4FC" }} className="p-4 rounded-lg">
          <Text style={{ color: "#1A75BB" }} className="font-semibold mb-2">About</Text>
          <Text style={{ color: "#0D5A94" }} className="text-sm">
            JET2 NAV is an accessible indoor navigation system designed to help users navigate buildings with voice guidance and haptic feedback.
          </Text>
        </View>
      </View>
    </View>
  );
}
