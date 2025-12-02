import { View, Text, TouchableOpacity, Animated, Alert } from "react-native";
import { useState, useRef, useEffect } from "react";
import { useNavigation } from "../contexts/NavigationContext";
import { navigationService, NavigationInstruction } from "../services/navigationService";
import { speechService } from "../services/speechService";
import { voiceService } from "../services/voiceService";
import { aiService } from "../services/aiService";
import * as Haptics from "expo-haptics";

export default function NavigatePage() {
  const [isListening, setIsListening] = useState(false);
  const [route, setRoute] = useState<NavigationInstruction[] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasAnnounced, setHasAnnounced] = useState(false);
  const [pendingRoom, setPendingRoom] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { state, startNavigation, setDestination } = useNavigation();

  useEffect(() => {
    // When page loads, announce the instruction
    const announceOnLoad = async () => {
      if (!hasAnnounced && state.settings.voiceGuidanceEnabled && state.currentLocation) {
        await speechService.speak(
          `OK, got ${state.currentLocation}. Press the screen to specify the room!`
        );
        setHasAnnounced(true);
      }
    };

    announceOnLoad();

    // Check if we have a destination to navigate to
    if (state.destination && !route) {
      initializeNavigation();
    }
  }, [state.destination]);

  useEffect(() => {
    // Auto-progress through instructions
    if (route && currentStepIndex < route.length - 1) {
      const timer = setTimeout(() => {
        progressToNextStep();
      }, 5000); // Progress every 5 seconds

      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, route]);

  const initializeNavigation = async () => {
    const foundRoute = navigationService.findRoute(
      state.currentLocation,
      state.destination
    );

    if (foundRoute) {
      setRoute(foundRoute.instructions);
      startNavigation();

      // Announce first instruction
      if (state.settings.voiceGuidanceEnabled) {
        await speechService.announceInstruction(foundRoute.instructions[0].description);
      }
    } else {
      Alert.alert("Error", "Route not found for this destination");
    }
  };

  const progressToNextStep = async () => {
    if (!route) return;

    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);

    const nextInstruction = route[nextIndex];

    // Haptic feedback
    if (state.settings.hapticFeedbackEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Voice announcement
    if (state.settings.voiceGuidanceEnabled && nextInstruction) {
      if (nextInstruction.type === "arrive") {
        await speechService.announceArrival(state.destination);
      } else {
        await speechService.announceInstruction(nextInstruction.description);
      }
    }
  };

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
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const result = await voiceService.stopListening();

      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      setIsListening(false);

      // Check if we're awaiting confirmation
      if (awaitingConfirmation && pendingRoom) {
        const confirmationResponse = await aiService.interpretConfirmation(result.transcript);

        if (confirmationResponse === "yes") {
          // User confirmed, start navigation
          setAwaitingConfirmation(false);
          setDestination(pendingRoom);
          const foundRoute = navigationService.findRoute(state.currentLocation, pendingRoom);

          if (foundRoute) {
            setRoute(foundRoute.instructions);
            setCurrentStepIndex(0);

            if (state.settings.voiceGuidanceEnabled) {
              await speechService.announceInstruction(foundRoute.instructions[0].description);
            }
          } else {
            await speechService.speak("Sorry, I couldn't find a route to that room");
          }
          setPendingRoom(null);
        } else if (confirmationResponse === "no") {
          // User said no, ask again
          setAwaitingConfirmation(false);
          setPendingRoom(null);
          await speechService.speak("OK, please specify the room again");
        } else {
          // User is specifying a new room
          setAwaitingConfirmation(false);
          setPendingRoom(null);
          // Process the new room specification
          await processRoomSpecification(result.transcript);
        }
      } else {
        // Initial room specification
        await processRoomSpecification(result.transcript);
      }
    } catch (error) {
      console.error("Voice error:", error);
      setIsListening(false);
      setAwaitingConfirmation(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  };

  const processRoomSpecification = async (transcript: string) => {
    // Use AI to recognize the room
    const aiResponse = await aiService.recognizeRoom(transcript, state.currentLocation);

    if (aiResponse.room && aiResponse.confidence > 0.3) {
      setPendingRoom(aiResponse.room);

      // Ask for confirmation
      setAwaitingConfirmation(true);
      if (state.settings.voiceGuidanceEnabled) {
        await speechService.speak(
          `I heard ${aiResponse.room}. Is that correct? Say yes to confirm or specify a different room.`
        );
      }
    } else {
      // Could not recognize room
      if (state.settings.voiceGuidanceEnabled) {
        await speechService.speak("Sorry, I didn't catch that. Please specify the room number again.");
      }
    }
  };

  const currentInstruction = route?.[currentStepIndex];

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-4">
        <View className="bg-gray-200 p-5 rounded-lg mb-4">
          <Text className="text-gray-800 text-lg font-medium">{state.currentLocation}</Text>
        </View>

        <View className="bg-gray-200 p-5 rounded-lg mb-4">
          {state.destination ? (
            <Text className="text-gray-800 text-lg font-medium">{state.destination}</Text>
          ) : (
            <Text className="text-gray-400 text-lg font-medium">Destination</Text>
          )}
        </View>

        {currentInstruction && (
          <View className="bg-gray-200 p-5 rounded-lg mb-8 flex-row items-center">
            <Text className="text-3xl mr-3">{currentInstruction.icon}</Text>
            <Text className="text-gray-800 text-lg font-medium">
              {currentInstruction.description}
            </Text>
          </View>
        )}

        {route && currentStepIndex < route.length - 1 && (
          <View className="px-5">
            <Text className="text-gray-600 text-sm mb-2">
              Step {currentStepIndex + 1} of {route.length}
            </Text>
            <View className="bg-blue-200 h-2 rounded-full">
              <View
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${((currentStepIndex + 1) / route.length) * 100}%` }}
              />
            </View>
          </View>
        )}
      </View>

      <View className="flex-1 items-center justify-center pb-20">
        <TouchableOpacity
          onPress={handleMicPress}
          disabled={isListening || (route !== null && currentStepIndex < route.length - 1)}
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
