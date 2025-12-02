import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

class PlatformHaptics {
  async impactAsync(style: Haptics.ImpactFeedbackStyle): Promise<void> {
    if (Platform.OS === "web") {
      // Fallback for web - use vibration API if available
      if (navigator.vibrate) {
        const duration = this.getVibrationDuration(style);
        navigator.vibrate(duration);
      }
      return;
    }

    // Native platforms
    return Haptics.impactAsync(style);
  }

  private getVibrationDuration(style: Haptics.ImpactFeedbackStyle): number {
    switch (style) {
      case Haptics.ImpactFeedbackStyle.Light:
        return 10;
      case Haptics.ImpactFeedbackStyle.Medium:
        return 20;
      case Haptics.ImpactFeedbackStyle.Heavy:
        return 30;
      default:
        return 20;
    }
  }
}

export const platformHaptics = new PlatformHaptics();
export { ImpactFeedbackStyle } from "expo-haptics";
