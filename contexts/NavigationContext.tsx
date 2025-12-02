import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { voiceService } from "../services/voiceService";
import { speechService } from "../services/speechService";
import { aiService } from "../services/aiService";
import { config } from "../config";
import { NavigationInstruction } from "../services/navigationService";

type NavigationPhase = "building" | "room" | "navigating";

interface NavigationSettings {
  voiceGuidanceEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  volume: number;
}

interface NavigationState {
  phase: NavigationPhase;
  currentLocation: string;
  destination: string;
  isNavigating: boolean;
  currentInstruction: string;
  currentStep: number;
  totalSteps: number;
  route: NavigationInstruction[] | null;
  pendingRoom: string | null;
  awaitingConfirmation: boolean;
  settings: NavigationSettings;
}

interface NavigationContextType {
  state: NavigationState;
  setCurrentLocation: (location: string) => void;
  setDestination: (destination: string) => void;
  setPhase: (phase: NavigationPhase) => void;
  setRoute: (route: NavigationInstruction[] | null) => void;
  setCurrentStep: (step: number) => void;
  clearRoute: () => void;
  setPendingRoom: (room: string | null) => void;
  setAwaitingConfirmation: (value: boolean) => void;
  startNavigation: () => void;
  stopNavigation: () => void;
  nextInstruction: () => void;
  updateSettings: (settings: Partial<NavigationSettings>) => void;
  resetNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const createInitialState = (): NavigationState => ({
  phase: "building",
  currentLocation: "User Location",
  destination: "",
  isNavigating: false,
  currentInstruction: "",
  currentStep: 0,
  totalSteps: 0,
  route: null,
  pendingRoom: null,
  awaitingConfirmation: false,
  settings: {
    voiceGuidanceEnabled: true,
    hapticFeedbackEnabled: true,
    volume: 1.0,
  },
});

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavigationState>(createInitialState());

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

  const setPhase = (phase: NavigationPhase) => {
    setState((prev) => ({ ...prev, phase }));
  };

  const setDestination = (destination: string) => {
    setState((prev) => ({ ...prev, destination }));
  };

  const setRoute = (route: NavigationInstruction[] | null) => {
    setState((prev) => ({
      ...prev,
      route,
      currentStep: 0,
      totalSteps: route ? route.length : 0,
    }));
  };

  const clearRoute = () => {
    setState((prev) => ({
      ...prev,
      route: null,
      currentStep: 0,
      totalSteps: 0,
      isNavigating: false,
      currentInstruction: "",
      destination: "",
    }));
  };

  const setPendingRoom = (room: string | null) => {
    setState((prev) => ({ ...prev, pendingRoom: room }));
  };

  const setAwaitingConfirmation = (value: boolean) => {
    setState((prev) => ({ ...prev, awaitingConfirmation: value }));
  };

  const setCurrentStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const startNavigation = () => {
    setState((prev) => ({ ...prev, isNavigating: true, currentStep: 0, phase: "navigating" }));
  };

  const stopNavigation = () => {
    setState((prev) => ({
      ...prev,
      isNavigating: false,
      currentStep: 0,
      currentInstruction: "",
      phase: "room",
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

  const resetNavigation = () => {
    setState(createInitialState());
  };

  return (
    <NavigationContext.Provider
      value={{
        state,
        setCurrentLocation,
        setDestination,
        setPhase,
        setRoute,
        setCurrentStep,
        clearRoute,
        setPendingRoom,
        setAwaitingConfirmation,
        startNavigation,
        stopNavigation,
        nextInstruction,
        updateSettings,
        resetNavigation,
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
