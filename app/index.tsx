import { View, Text, TouchableOpacity, Animated, Alert, Image } from "react-native";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { useNavigation } from "../contexts/NavigationContext";
import { voiceService } from "../services/voiceService";
import { speechService } from "../services/speechService";
import { aiService } from "../services/aiService";

export default function HomePage() {
  const [isListening, setIsListening] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [hasGreeted, setHasGreeted] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const { setCurrentLocation, setPhase, clearRoute, setDestination, state } = useNavigation();

  useEffect(() => {
    // Announce the prompt on app launch
    const announcePrompt = async () => {
      if (!hasGreeted && state.settings.voiceGuidanceEnabled) {
        await speechService.speak("Which building?");
        setHasGreeted(true);
      }
    };

    announcePrompt();
  }, []);

  const handleMicPress = async () => {
    try {
      setIsListening(true);

      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start recording immediately without announcement
      await voiceService.startListening();

      // Simulate listening for 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Stop recording and get result
      const result = await voiceService.stopListening();

      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      // Use AI to recognize the building
      const aiResponse = await aiService.recognizeBuilding(result.transcript);

      if (aiResponse.building && aiResponse.confidence > 0.5) {
        // Display the recognized building
        setDisplayText(aiResponse.building);

        // Set building as current location
        setCurrentLocation(aiResponse.building);
        // Clear any stale navigation data and move to room capture phase
        clearRoute();
        setDestination("");
        setPhase("room");

        // Navigate to navigation page immediately
        router.push("/navigate");
      } else {
        // Could not recognize building
        setIsListening(false);
        setDisplayText("");

        if (state.settings.voiceGuidanceEnabled) {
          await speechService.speak("Sorry, I didn't catch that. Please say ECS West, JSOM, or ECS South");
        } else {
          Alert.alert("Invalid Building", "Please say ECS West, JSOM, or ECS South");
        }
      }
    } catch (error) {
      console.error("Voice recognition error:", error);
      Alert.alert(
        "Error",
        "Failed to recognize voice input. Please try again.",
        [{ text: "OK" }]
      );
      setIsListening(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1A75BB" }} className="items-center justify-center">
      {displayText ? (
        <Text className="text-white text-5xl font-bold mb-12">{displayText}</Text>
      ) : (
        <Text className="text-white text-4xl font-bold mb-12">Which Building?</Text>
      )}

      <TouchableOpacity
        onPress={handleMicPress}
        disabled={isListening}
        activeOpacity={0.8}
      >
        <Animated.View
          style={{
            width: 256,
            height: 256,
            backgroundColor: "#0D5A94",
            borderRadius: 128,
            transform: [{ scale: pulseAnim }]
          }}
          className="items-center justify-center"
        >
          <Image
            source={require("../assets/mic.png")}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        </Animated.View>
      </TouchableOpacity>

      {isListening && !displayText && (
        <Text className="text-white text-xl mt-8">Listening...</Text>
      )}
    </View>
  );
}
