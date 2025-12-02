import * as Speech from "expo-speech";
import { Audio } from "expo-av";

class SpeechService {
  private isSpeaking = false;
  private openAiApiKey: string = "";
  private currentSound: Audio.Sound | null = null;

  setApiKey(apiKey: string): void {
    this.openAiApiKey = apiKey;
  }

  async speak(text: string, options?: { rate?: number; pitch?: number }): Promise<void> {
    // Use OpenAI TTS if API key is available, otherwise fall back to Expo Speech
    if (this.openAiApiKey) {
      return this.speakWithOpenAI(text, options);
    } else {
      return this.speakWithExpo(text, options);
    }
  }

  private async speakWithOpenAI(text: string, options?: { rate?: number; pitch?: number }): Promise<void> {
    try {
      this.isSpeaking = true;

      // Call OpenAI TTS API
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.openAiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: "alloy", // Options: alloy, echo, fable, onyx, nova, shimmer
          speed: options?.rate || 1.0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI TTS error: ${response.status} - ${errorText}`);
      }

      // Get audio as base64
      const arrayBuffer = await response.arrayBuffer();
      const base64Audio = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Create data URI for React Native
      const audioUri = `data:audio/mp3;base64,${base64Audio}`;

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Play audio using Expo AV
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      this.currentSound = sound;

      // Wait for audio to finish
      await new Promise<void>((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            this.isSpeaking = false;
            sound.unloadAsync();
            resolve();
          }
        });
      });
    } catch (error) {
      console.error("OpenAI TTS error:", error);
      // Fallback to Expo Speech on error
      this.isSpeaking = false;
      return this.speakWithExpo(text, options);
    }
  }

  private async speakWithExpo(text: string, options?: { rate?: number; pitch?: number }): Promise<void> {
    return new Promise((resolve) => {
      this.isSpeaking = true;

      Speech.speak(text, {
        language: "en-US",
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.9,
        onDone: () => {
          this.isSpeaking = false;
          resolve();
        },
        onError: () => {
          this.isSpeaking = false;
          resolve();
        },
      });
    });
  }

  stop(): void {
    Speech.stop();
    if (this.currentSound) {
      this.currentSound.stopAsync();
      this.currentSound.unloadAsync();
      this.currentSound = null;
    }
    this.isSpeaking = false;
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  async announceInstruction(instruction: string): Promise<void> {
    await this.speak(instruction, { rate: 0.85 });
  }

  async announceArrival(destination: string): Promise<void> {
    await this.speak(`You have arrived at ${destination}`, { rate: 0.8 });
  }
}

export const speechService = new SpeechService();
