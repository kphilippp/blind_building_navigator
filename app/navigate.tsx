import { View, Text, TouchableOpacity, Animated, Image } from "react-native";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { useNavigation } from "../contexts/NavigationContext";
import { navigationService } from "../services/navigationService";
import { speechService } from "../services/speechService";
import { voiceService } from "../services/voiceService";
import { aiService } from "../services/aiService";
import * as Haptics from "expo-haptics";

export default function NavigatePage() {
  const [isListening, setIsListening] = useState(false);
  const [hasAnnounced, setHasAnnounced] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const {
    state,
    startNavigation,
    setDestination,
    setPhase,
    setRoute,
    clearRoute,
    setPendingRoom,
    setAwaitingConfirmation,
    setCurrentStep,
  } = useNavigation();

  const route = state.route;
  const currentStepIndex = state.currentStep;
  const pendingRoom = state.pendingRoom;
  const awaitingConfirmation = state.awaitingConfirmation;

  useEffect(() => {
    // When page loads, announce the instruction
    const announceOnLoad = async () => {
      if (hasAnnounced || !state.settings.voiceGuidanceEnabled) return;
      if (!state.currentLocation) return;
      await speechService.speak(
        `OK, got ${state.currentLocation}. Press the screen to specify the room!`
      );
      setHasAnnounced(true);
    };

    announceOnLoad();
  }, [state.settings.voiceGuidanceEnabled, state.currentLocation, hasAnnounced]);

  useEffect(() => {
    // Auto-progress through instructions
    if (state.phase === "navigating" && route && currentStepIndex < route.length - 1) {
      const timer = setTimeout(() => {
        progressToNextStep();
      }, 5000); // Progress every 5 seconds

      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, route, state.phase]);

  const progressToNextStep = async () => {
    if (!route || state.phase !== "navigating") return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= route.length) return;
    setCurrentStep(nextIndex);

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
      await handleTranscript(result.transcript);
    } catch (error) {
      console.error("Voice error:", error);
      setIsListening(false);
      setAwaitingConfirmation(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  };

  const handleTranscript = async (transcript: string) => {
    // If we're awaiting a yes/no, interpret that first
    if (awaitingConfirmation && pendingRoom) {
      const confirmationResponse = await aiService.interpretConfirmation(transcript);

      if (confirmationResponse === "yes") {
        setAwaitingConfirmation(false);
        const confirmedRoom = pendingRoom;
        setPendingRoom(null);
        setDestination(confirmedRoom);

        const foundRoute = navigationService.findRoute(state.currentLocation, confirmedRoom);

        // For demo: proceed to guidance even if no route; use a placeholder when missing
        const instructions = foundRoute?.instructions || [
          { type: "arrive", description: "Guidance placeholder", icon: "🧭" },
        ];

        setRoute(instructions);
        setPhase("navigating");
        startNavigation();
        setCurrentStep(0);

        if (state.settings.voiceGuidanceEnabled && foundRoute?.instructions?.[0]) {
          await speechService.announceInstruction(foundRoute.instructions[0].description);
        }
        router.replace("/guidance");
        return;
      }

      if (confirmationResponse === "no") {
        setAwaitingConfirmation(false);
        setPendingRoom(null);
        await speechService.speak("OK, please specify the room again");
        return;
      }

      // User likely said a different room
      setAwaitingConfirmation(false);
      setPendingRoom(null);
    }

    await processRoomSpecification(transcript);
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
  const waitingForRoom = state.phase === "room" && !route;

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-4">
        <View style={{ backgroundColor: "#E8F4FC" }} className="p-5 rounded-lg mb-4">
          <Text style={{ color: "#1A75BB" }} className="text-lg font-medium">{state.currentLocation}</Text>
        </View>

        <View style={{ backgroundColor: "#E8F4FC" }} className="p-5 rounded-lg mb-4">
          {state.destination ? (
            <Text style={{ color: "#1A75BB" }} className="text-lg font-medium">{state.destination}</Text>
          ) : (
            <Text className="text-gray-400 text-lg font-medium">Destination</Text>
          )}
        </View>

        {currentInstruction && (
          <View style={{ backgroundColor: "#E8F4FC" }} className="p-5 rounded-lg mb-8 flex-row items-center">
            <Text className="text-3xl mr-3">{currentInstruction.icon}</Text>
            <Text style={{ color: "#1A75BB" }} className="text-lg font-medium">
              {currentInstruction.description}
            </Text>
          </View>
        )}

        {waitingForRoom && (
          <View style={{ backgroundColor: "#FFF6E5" }} className="p-4 rounded-lg mb-4">
            <Text style={{ color: "#B45309" }} className="text-base font-medium">
              Awaiting room. Press the mic and say the room number.
            </Text>
            {pendingRoom && (
              <Text style={{ color: "#92400E" }} className="mt-2">
                Confirm: {pendingRoom} (say yes to confirm or say the room again)
              </Text>
            )}
          </View>
        )}

        {route && state.phase === "navigating" && currentStepIndex < route.length - 1 && (
          <View className="px-5">
            <Text className="text-gray-600 text-sm mb-2">
              Step {currentStepIndex + 1} of {route.length}
            </Text>
            <View style={{ backgroundColor: "#B8DAEF" }} className="h-2 rounded-full">
              <View
                style={{
                  backgroundColor: "#1A75BB",
                  width: `${((currentStepIndex + 1) / route.length) * 100}%`
                }}
                className="h-2 rounded-full"
              />
            </View>
          </View>
        )}
      </View>

      <View className="flex-1 items-center justify-center pb-20">
        <TouchableOpacity
          onPress={handleMicPress}
          disabled={
            isListening ||
            (state.phase === "navigating" && route !== null && currentStepIndex < route.length - 1)
          }
          activeOpacity={0.8}
        >
          <Animated.View
            style={{
              width: 160,
              height: 160,
              backgroundColor: "#1A75BB",
              borderRadius: 80,
              transform: [{ scale: pulseAnim }]
            }}
            className="items-center justify-center"
          >
            <Image
              source={require("../assets/mic.png")}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </Animated.View>
        </TouchableOpacity>

        {isListening && (
          <Text style={{ color: "#1A75BB" }} className="text-xl mt-8">Listening...</Text>
        )}

        {route && state.phase === "navigating" && currentInstruction?.type === "arrive" && (
          <TouchableOpacity
            className="mt-6 px-6 py-3 rounded-full"
            style={{ backgroundColor: "#1A75BB" }}
            onPress={() => {
              clearRoute();
              setPhase("room");
              setDestination("");
              setPendingRoom(null);
              setAwaitingConfirmation(false);
            }}
          >
            <Text className="text-white font-semibold">Navigate to another room</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
