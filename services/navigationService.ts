export interface NavigationInstruction {
  type: "turn" | "walk" | "arrive";
  direction?: "left" | "right" | "forward";
  distance?: number;
  description: string;
  icon: string;
}

export interface Route {
  from: string;
  to: string;
  instructions: NavigationInstruction[];
  estimatedTime: number;
}

// Mock building graph - in production, this would come from a backend/database
const buildingGraph: Record<string, Record<string, NavigationInstruction[]>> = {
  "User Location": {
    "ECSW 1.315": [
      {
        type: "turn",
        direction: "right",
        distance: 10,
        description: "Turn Right in 10 Steps",
        icon: "➡️",
      },
      {
        type: "walk",
        direction: "forward",
        distance: 20,
        description: "Take 20 Steps Forward",
        icon: "⬆️",
      },
      {
        type: "arrive",
        description: "Arrived!",
        icon: "✅",
      },
    ],
    "ECSW 2.100": [
      {
        type: "turn",
        direction: "left",
        distance: 5,
        description: "Turn Left in 5 Steps",
        icon: "⬅️",
      },
      {
        type: "walk",
        direction: "forward",
        distance: 15,
        description: "Take 15 Steps Forward",
        icon: "⬆️",
      },
      {
        type: "turn",
        direction: "right",
        distance: 3,
        description: "Turn Right in 3 Steps",
        icon: "➡️",
      },
      {
        type: "arrive",
        description: "Arrived!",
        icon: "✅",
      },
    ],
  },
};

class NavigationService {
  findRoute(from: string, to: string): Route | null {
    const instructions = buildingGraph[from]?.[to];

    if (!instructions) {
      return null;
    }

    return {
      from,
      to,
      instructions,
      estimatedTime: this.calculateEstimatedTime(instructions),
    };
  }

  private calculateEstimatedTime(instructions: NavigationInstruction[]): number {
    // Rough estimate: 1 second per step, 2 seconds per turn
    let totalSeconds = 0;

    instructions.forEach((instruction) => {
      if (instruction.type === "walk" && instruction.distance) {
        totalSeconds += instruction.distance;
      } else if (instruction.type === "turn") {
        totalSeconds += 2;
      }
    });

    return totalSeconds;
  }

  parseDestination(voiceInput: string): string {
    // Clean up voice input and match to known destinations
    const input = voiceInput.trim().toUpperCase();

    // Exact match
    if (buildingGraph["User Location"]?.[input]) {
      return input;
    }

    // Partial match (e.g., "ECSW" matches "ECSW 1.315")
    const destinations = Object.keys(buildingGraph["User Location"] || {});
    for (const dest of destinations) {
      if (dest.toUpperCase().includes(input) || input.includes(dest.toUpperCase())) {
        return dest;
      }
    }

    // Return the input as-is if no match
    return voiceInput;
  }

  getAvailableDestinations(): string[] {
    return Object.keys(buildingGraph["User Location"] || {});
  }
}

export const navigationService = new NavigationService();
