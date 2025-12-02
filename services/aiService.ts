/**
 * AI Service for intelligent building and room recognition
 * Uses OpenAI GPT to interpret user speech and map to actual UTD locations
 */

interface AIResponse {
  building?: string;
  room?: string;
  confidence: number;
  needsConfirmation: boolean;
  interpretation: string;
}

class AIService {
  private openAiApiKey: string = "";

  setApiKey(apiKey: string): void {
    this.openAiApiKey = apiKey;
  }

  /**
   * Intelligently map user's spoken input to a UTD building
   */
  async recognizeBuilding(userInput: string): Promise<AIResponse> {
    if (!this.openAiApiKey) {
      // Fallback to simple matching if no API key
      return this.simpleBuildingMatch(userInput);
    }

    try {
      const prompt = `You are a UTD campus navigation assistant. The user said: "${userInput}"

Available UTD buildings:
- ECS WEST (Engineering and Computer Science West)
- JSOM (Jindal School of Management)
- ECS SOUTH (Engineering and Computer Science South)

Task: Determine which building the user is referring to.

Respond in JSON format:
{
  "building": "exact building name from the list above",
  "confidence": number between 0-1,
  "interpretation": "brief explanation of your interpretation"
}

If the user's input doesn't clearly match any building, set confidence to 0.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.openAiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      const aiResponse = JSON.parse(result.choices[0].message.content);

      console.log(`[AI] Building recognition: "${userInput}" → "${aiResponse.building}" (${aiResponse.confidence})`);

      return {
        building: aiResponse.building,
        confidence: aiResponse.confidence,
        needsConfirmation: aiResponse.confidence < 0.8,
        interpretation: aiResponse.interpretation,
      };
    } catch (error) {
      console.error("AI Service error:", error);
      return this.simpleBuildingMatch(userInput);
    }
  }

  /**
   * Intelligently interpret and confirm room specification
   */
  async recognizeRoom(userInput: string, building: string): Promise<AIResponse> {
    if (!this.openAiApiKey) {
      return this.simpleRoomMatch(userInput);
    }

    try {
      const prompt = `You are a UTD campus navigation assistant. The user is in ${building} and said: "${userInput}"

Common room formats at UTD:
- Format: BUILDING FLOOR.ROOM (e.g., "ECSW 1.315", "JSOM 2.801")
- Users might say: "room 315", "three fifteen", "second floor room 801", "classroom 315", etc.

Task: Extract the room number and format it correctly.

Respond in JSON format:
{
  "room": "formatted room (e.g., ECSW 1.315)",
  "confidence": number between 0-1,
  "interpretation": "what you understood"
}

If unclear, set confidence below 0.6.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.openAiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      const aiResponse = JSON.parse(result.choices[0].message.content);

      console.log(`[AI] Room recognition: "${userInput}" → "${aiResponse.room}" (${aiResponse.confidence})`);

      return {
        room: aiResponse.room,
        confidence: aiResponse.confidence,
        needsConfirmation: aiResponse.confidence < 0.8,
        interpretation: aiResponse.interpretation,
      };
    } catch (error) {
      console.error("AI Service error:", error);
      return this.simpleRoomMatch(userInput);
    }
  }

  /**
   * Interpret confirmation response (yes/no/specify another)
   */
  async interpretConfirmation(userInput: string): Promise<"yes" | "no" | "specify"> {
    if (!this.openAiApiKey) {
      return this.simpleConfirmationMatch(userInput);
    }

    try {
      const prompt = `The user said: "${userInput}"

Is this a YES (affirmative), NO (negative), or are they SPECIFYING something else?

Respond with just one word: "yes", "no", or "specify"`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.openAiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      const answer = result.choices[0].message.content.trim().toLowerCase();

      console.log(`[AI] Confirmation: "${userInput}" → "${answer}"`);

      if (answer.includes("yes")) return "yes";
      if (answer.includes("no")) return "no";
      return "specify";
    } catch (error) {
      console.error("AI Service error:", error);
      return this.simpleConfirmationMatch(userInput);
    }
  }

  private simpleBuildingMatch(input: string): AIResponse {
    const normalized = input.trim().toUpperCase();

    if (normalized.includes("WEST") || normalized.includes("ECS W")) {
      return {
        building: "ECS WEST",
        confidence: 0.9,
        needsConfirmation: false,
        interpretation: "Matched 'west' keyword",
      };
    }
    if (normalized.includes("JSOM") || normalized.includes("J SOM")) {
      return {
        building: "JSOM",
        confidence: 0.9,
        needsConfirmation: false,
        interpretation: "Matched 'JSOM' keyword",
      };
    }
    if (normalized.includes("SOUTH") || normalized.includes("ECS S")) {
      return {
        building: "ECS SOUTH",
        confidence: 0.9,
        needsConfirmation: false,
        interpretation: "Matched 'south' keyword",
      };
    }

    return {
      building: undefined,
      confidence: 0,
      needsConfirmation: true,
      interpretation: "No match found",
    };
  }

  private simpleRoomMatch(input: string): AIResponse {
    const normalized = input.trim().toUpperCase();
    const roomMatch = normalized.match(/(\d{1,4})/);

    if (roomMatch) {
      return {
        room: roomMatch[1],
        confidence: 0.7,
        needsConfirmation: true,
        interpretation: `Extracted room number: ${roomMatch[1]}`,
      };
    }

    return {
      room: undefined,
      confidence: 0,
      needsConfirmation: true,
      interpretation: "Could not extract room number",
    };
  }

  private simpleConfirmationMatch(input: string): "yes" | "no" | "specify" {
    const normalized = input.trim().toLowerCase();

    if (
      normalized.includes("yes") ||
      normalized.includes("yeah") ||
      normalized.includes("correct") ||
      normalized.includes("right") ||
      normalized.includes("yep")
    ) {
      return "yes";
    }

    if (
      normalized.includes("no") ||
      normalized.includes("nope") ||
      normalized.includes("wrong") ||
      normalized.includes("incorrect")
    ) {
      return "no";
    }

    return "specify";
  }
}

export const aiService = new AIService();
