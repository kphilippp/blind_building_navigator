import { Audio } from "expo-av";

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
}

class VoiceService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private openAiApiKey: string = "";
  private mockIndex: number = 0;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  }

  async startListening(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Microphone permission not granted");
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }

  async stopListening(): Promise<VoiceRecognitionResult> {
    try {
      if (!this.recording) {
        throw new Error("No active recording");
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isRecording = false;

      // If OpenAI API key is set, use Whisper API, otherwise use mock
      if (this.openAiApiKey && uri) {
        return await this.whisperRecognition(uri);
      } else {
        return this.mockRecognition();
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      throw error;
    }
  }

  private async whisperRecognition(audioUri: string): Promise<VoiceRecognitionResult> {
    try {
      // Create form data for multipart upload
      const formData = new FormData();

      // Append the audio file with proper type
      formData.append("file", {
        uri: audioUri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any);
      formData.append("model", "whisper-1");
      formData.append("language", "en");

      // Call OpenAI Whisper API
      const apiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.openAiApiKey}`,
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Whisper API error: ${apiResponse.status} - ${errorText}`);
      }

      const result = await apiResponse.json();

      console.log(`[Whisper] Transcribed: "${result.text}"`);

      return {
        transcript: result.text,
        confidence: 1.0,
      };
    } catch (error) {
      console.error("Whisper API error:", error);
      // Fallback to mock if API fails
      return this.mockRecognition();
    }
  }

  private mockRecognition(): VoiceRecognitionResult {
    // Simulate voice recognition - cycles through options for testing
    const mockDestinations = [
      "ECS WEST",
      "JSOM",
      "ECS SOUTH",
      "ECSW 1.315",
      "ECSW 2.100",
      "JSOM 1.201",
    ];

    // Cycle through destinations in order for consistent testing
    const destination = mockDestinations[this.mockIndex % mockDestinations.length];
    this.mockIndex++;

    console.log(`[MOCK] Transcribed: "${destination}"`);

    return {
      transcript: destination,
      confidence: 0.95,
    };
  }

  setApiKey(apiKey: string): void {
    this.openAiApiKey = apiKey;
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }
}

export const voiceService = new VoiceService();
