import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";

export default function HomePage() {
  const [isListening, setIsListening] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    if (isListening) {
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

      // After 3 seconds, show "ECSW"
      setTimeout(() => {
        setDisplayText("ECSW");
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);

        // After 1 more second, navigate to navigate page
        setTimeout(() => {
          router.push("/navigate");
        }, 1000);
      }, 3000);
    }
  }, [isListening]);

  const handleMicPress = () => {
    setIsListening(true);
  };

  return (
    <View className="flex-1 bg-blue-500 items-center justify-center">
      {displayText ? (
        <Text className="text-white text-5xl font-bold mb-12">{displayText}</Text>
      ) : (
        <Text className="text-white text-4xl font-bold mb-12">Where To?</Text>
      )}

      <TouchableOpacity
        onPress={handleMicPress}
        disabled={isListening}
        activeOpacity={0.8}
      >
        <Animated.View
          className="w-64 h-64 bg-blue-700 rounded-full items-center justify-center"
          style={{ transform: [{ scale: pulseAnim }] }}
        >
          <Text className="text-white text-8xl">🎤</Text>
        </Animated.View>
      </TouchableOpacity>

      {isListening && !displayText && (
        <Text className="text-white text-xl mt-8">Listening...</Text>
      )}
    </View>
  );
}
