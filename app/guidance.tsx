import { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, Animated, Text, Image, ImageBackground, Pressable } from "react-native";
import { voiceService } from "../services/voiceService";
import { speechService } from "../services/speechService";
import * as Haptics from "expo-haptics";

export default function GuidancePage() {
  const [isListening, setIsListening] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState<string | null>(null);
  const [tapPrompt, setTapPrompt] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotOffset = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const tripleTapResolver = useRef<(() => void) | null>(null);
  const tapCountRef = useRef(0);

  const handleMicPress = async () => {
    try {
      setIsListening(true);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();

      await voiceService.startListening();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await voiceService.stopListening();
    } catch (e) {
      console.error("Mic error:", e);
    } finally {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      setIsListening(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    let x = 0;
    let y = 0;

    const steps = [
      {
        text: "Turn Left and Take 2 steps forwards",
        duration: 1000,
        deltaX: -5,
        deltaY: 0,
        hapticCount: 1,
      },
      {
        text: "Ok this next instruction has some steps be careful.",
        duration: 1000,
        deltaX: 0,
        deltaY: 0,
        hapticCount: 0,
      },{
        text: "Turn right and take 10 steps forward",
        duration: 3500,
        deltaX: 0,
        deltaY: -25,
        hapticCount: 2,
      },      
      {
        text: "There's a door, go through it. Be careful this is a high traffic area.",
        duration: 3000,
        deltaX: 0,
        deltaY: -10,
        hapticCount: 5,
      },
      {
        text: "Now take a couple steps and turn right",
        duration: 1000,
        deltaX: 0,
        deltaY: -2,
        hapticCount: 1,
      },{
        text: "Now take about 35 steps forwards.",
        duration: 10000,
        deltaX: 130,
        deltaY: 0,
        hapticCount: 0,
      },{
        text: "Ok There should be an elevator ahead on your left, lets get in it.",
        duration: 3000,
        deltaX: 0,
        deltaY: -5,
        hapticCount: 5,
        tapPrompt: "Tap the screen three times once you're inside the elevator.",
      },{
        text: "Ok we need to go up to floor 3, press the button for floor 3 and exit the elevator on your right.",
        duration: 3100,
        deltaX: 0,
        deltaY: 0,
        hapticCount: 0,
        tapPrompt: "Tap the screen three times once you exit the elevator.",
      },{
        text: "Exit the elevator then turn right",
        duration: 2000,
        deltaX: 0,
        deltaY: 5,
        hapticCount: 1,
      },
    ];

    const waitForTripleTap = async (prompt: string) => {
      setTapPrompt(prompt);
      tapCountRef.current = 0;
      await new Promise<void>((resolve) => {
        tripleTapResolver.current = resolve;
      });
      tripleTapResolver.current = null;
      setTapPrompt(null);
    };

    const run = async () => {
      for (const step of steps) {
        if (isCancelled) break;
        setCurrentInstruction(step.text);

        // Start speaking immediately; don't block on completion
        speechService.speak(step.text).catch((err) => console.error("TTS error:", err));

        // Optional haptics per step
        if (step.hapticCount && step.hapticCount > 0) {
          for (let i = 0; i < step.hapticCount; i++) {
            if (isCancelled) break;
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (i < step.hapticCount - 1) {
              await new Promise((resolve) => setTimeout(resolve, 250));
            }
          }
        }

        // Wait 4 seconds before moving for this instruction
        await new Promise((resolve) => setTimeout(resolve, 4000));

        x += step.deltaX;
        y += step.deltaY;

        const move = Animated.timing(dotOffset, {
          toValue: { x, y },
          duration: step.duration,
          useNativeDriver: true,
        });

        move.start();
        await new Promise((resolve) => setTimeout(resolve, step.duration));

        // Elevator checkpoints: require triple-tap to continue
        if (step.tapPrompt) {
          await waitForTripleTap(step.tapPrompt);
        }
      }
      setCurrentInstruction(null);
    };

    run();

    return () => {
      isCancelled = true;
      dotOffset.stopAnimation();
    };
  }, [dotOffset]);

  const handleScreenTap = () => {
    if (tripleTapResolver.current) {
      tapCountRef.current += 1;
      if (tapCountRef.current >= 3) {
        tripleTapResolver.current();
      }
    }
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={handleScreenTap}>
      <View className="flex-1 bg-white">
        <View className="px-4 pt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-2">Your Location</Text>
          {currentInstruction && (
            <Text className="text-base text-gray-700 mb-2">{currentInstruction}</Text>
          )}
          {tapPrompt && (
            <Text className="text-base text-blue-700 mb-2">{tapPrompt}</Text>
          )}
        </View>

      <View className="px-4">
        <View
          style={{
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: "#F3F4F6",
            position: "relative",
          }}
        >
          <ImageBackground
            source={require("../assets/floorplan.png")}
            resizeMode="contain"
            style={{
              width: "100%",
              aspectRatio: 1.2,
              justifyContent: "flex-end",
              alignItems: "flex-start",
              position: "relative",
            }}
          >
            {/* Static red dot bottom-left for now; will animate per instructions later */}
            <Animated.View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#EF4444",
                position: "absolute",
                left: "40%",
                bottom: "24%",
                borderWidth: 2,
                borderColor: "#FFFFFF",
                transform: dotOffset.getTranslateTransform(),
              }}
            />
          </ImageBackground>
        </View>
      </View>

        <View className="flex-1 items-center justify-center pb-16">
          <TouchableOpacity onPress={handleMicPress} disabled={isListening} activeOpacity={0.85}>
            <Animated.View
              style={{
                width: 200,
                height: 200,
                backgroundColor: "#1A75BB",
                borderRadius: 100,
                transform: [{ scale: pulseAnim }],
              }}
              className="items-center justify-center"
            >
              <Image
                source={require("../assets/mic.png")}
                style={{ width: 96, height: 96 }}
                resizeMode="contain"
              />
            </Animated.View>
          </TouchableOpacity>

          {isListening && (
            <Text style={{ color: "#1A75BB" }} className="text-xl mt-8">
              Listening...
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
