import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useState, useRef, useEffect } from "react";

export default function NavigatePage() {
  const [isListening, setIsListening] = useState(false);
  const [destination, setDestination] = useState("");
  const [showDirections, setShowDirections] = useState(false);
  const [currentDirection, setCurrentDirection] = useState("Turn Right in 10 Steps");
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

      // After 3 seconds, show "ECSW 1.315"
      setTimeout(() => {
        setDestination("ECSW 1.315");
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
        setIsListening(false);

        // After a brief moment, show directions
        setTimeout(() => {
          setShowDirections(true);
        }, 500);
      }, 3000);
    }
  }, [isListening]);

  useEffect(() => {
    if (showDirections) {
      // After 5 seconds, update to next instruction
      const timer1 = setTimeout(() => {
        setCurrentDirection("Take 20 Steps Forward");

        // After another 5 seconds, show "Arrived!"
        const timer2 = setTimeout(() => {
          setCurrentDirection("Arrived!");
        }, 5000);
      }, 5000);

      return () => clearTimeout(timer1);
    }
  }, [showDirections]);

  const handleMicPress = () => {
    setIsListening(true);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-4">
        <View className="bg-gray-200 p-5 rounded-lg mb-4">
          <Text className="text-gray-800 text-lg font-medium">User Location</Text>
        </View>

        <View className="bg-gray-200 p-5 rounded-lg mb-4">
          {destination ? (
            <Text className="text-gray-800 text-lg font-medium">{destination}</Text>
          ) : (
            <Text className="text-gray-400 text-lg font-medium">Destination</Text>
          )}
        </View>

        {showDirections && (
          <View className="bg-gray-200 p-5 rounded-lg mb-8 flex-row items-center">
            <Text className="text-3xl mr-3">
              {currentDirection.includes("Right") ? "➡️" : currentDirection.includes("Arrived") ? "✅" : "⬆️"}
            </Text>
            <Text className="text-gray-800 text-lg font-medium">{currentDirection}</Text>
          </View>
        )}
      </View>

      <View className="flex-1 items-center justify-center pb-20">
        <TouchableOpacity
          onPress={handleMicPress}
          disabled={isListening || destination !== ""}
          activeOpacity={0.8}
        >
          <Animated.View
            className="w-40 h-40 bg-blue-700 rounded-full items-center justify-center"
            style={{ transform: [{ scale: pulseAnim }] }}
          >
            <Text className="text-white text-6xl">🎤</Text>
          </Animated.View>
        </TouchableOpacity>

        {isListening && (
          <Text className="text-gray-800 text-xl mt-8">Listening...</Text>
        )}
      </View>
    </View>
  );
}
