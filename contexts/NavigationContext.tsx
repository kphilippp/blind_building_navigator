import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { voiceService } from "../services/voiceService";
import { speechService } from "../services/speechService";
import { aiService } from "../services/aiService";
import { config } from "../config";

interface NavigationSettings {
  voiceGuidanceEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  volume: number;
}

interface NavigationState {
  currentLocation: string;
  destination: string;
  isNavigating: boolean;
  currentInstruction: string;
  currentStep: number;
  totalSteps: number;
  settings: NavigationSettings;
}

interface NavigationContextType {
  state: NavigationState;
  setCurrentLocation: (location: string) => void;
  setDestination: (destination: string) => void;
  startNavigation: () => void;
  stopNavigation: () => void;
  nextInstruction: () => void;
  updateSettings: (settings: Partial<NavigationSettings>) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavigationState>({
    currentLocation: "User Location",
    destination: "",
    isNavigating: false,
    currentInstruction: "",
    currentStep: 0,
    totalSteps: 0,
    settings: {
      voiceGuidanceEnabled: true,
      hapticFeedbackEnabled: true,
      volume: 1.0,
    },
  });

  // Initialize voice, speech, and AI services with API key
  useEffect(() => {
    if (config.openAiApiKey) {
      voiceService.setApiKey(config.openAiApiKey);
      speechService.setApiKey(config.openAiApiKey);
      aiService.setApiKey(config.openAiApiKey);
    }
  }, []);

  const setCurrentLocation = (location: string) => {
    setState((prev) => ({ ...prev, currentLocation: location }));
  };

  const setDestination = (destination: string) => {
    setState((prev) => ({ ...prev, destination }));
  };

  const startNavigation = () => {
    setState((prev) => ({ ...prev, isNavigating: true, currentStep: 0 }));
  };

  const stopNavigation = () => {
    setState((prev) => ({
      ...prev,
      isNavigating: false,
      currentStep: 0,
      currentInstruction: "",
    }));
  };

  const nextInstruction = () => {
    setState((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
  };

  const updateSettings = (newSettings: Partial<NavigationSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  return (
    <NavigationContext.Provider
      value={{
        state,
        setCurrentLocation,
        setDestination,
        startNavigation,
        stopNavigation,
        nextInstruction,
        updateSettings,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
