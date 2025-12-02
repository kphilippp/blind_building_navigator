# JET2 NAV - Voice-Guided Campus Navigation

An accessible indoor navigation app for UTD campus using AI-powered voice recognition and text-to-speech.

## Features

- 🎤 **Voice-First Interface** - Completely hands-free navigation
- 🤖 **AI-Powered Recognition** - Understands natural speech using OpenAI GPT
- 🔊 **Text-to-Speech** - Natural voice guidance using OpenAI TTS
- 📍 **Turn-by-Turn Navigation** - Real-time navigation with haptic feedback
- ♿ **Accessibility Focused** - Designed for blind and visually impaired users

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Expo Go](https://expo.dev/client) app installed on your phone
- OpenAI API key with credits

## Setup Instructions

### 1. Clone/Download the Project

```bash
cd blind_building_navigator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure OpenAI API Key

1. Copy the example config file:
   ```bash
   cp config.example.ts config.ts
   ```

2. Get an OpenAI API key:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Add credits to your account at https://platform.openai.com/account/billing

3. Open `config.ts` and add your API key:
   ```typescript
   export const config = {
     openAiApiKey: "sk-proj-YOUR-API-KEY-HERE",
   };
   ```

### 4. Start the Development Server

```bash
npx expo start
```

### 5. Run on Your Phone

1. Install **Expo Go** from the App Store (iOS) or Google Play Store (Android)
2. Scan the QR code shown in the terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app
3. The app will load on your phone!

## How to Use

### First Time Setup

1. Grant microphone permissions when prompted
2. App will announce "Which building?"

### Navigation Flow

**Step 1: Select Building**
- Press the microphone button
- Say a building name (e.g., "ECS West", "JSOM", "Engineering building")
- AI will recognize and confirm the building

**Step 2: Specify Room**
- App announces: "OK, got [BUILDING]. Press the screen to specify the room!"
- Press the microphone button
- Say the room number (e.g., "Room 315", "three fifteen")
- App confirms: "I heard [ROOM]. Is that correct?"
- Say "yes" to start navigation OR specify a different room

**Step 3: Navigate**
- Follow turn-by-turn voice instructions
- Instructions auto-advance every 5 seconds
- Haptic feedback at each step

## Available Buildings

- **ECS WEST** - Engineering and Computer Science West
- **JSOM** - Jindal School of Management
- **ECS SOUTH** - Engineering and Computer Science South

## Settings

Access settings from the navigation header to:
- Toggle voice guidance on/off
- Enable/disable haptic feedback
- Test voice guidance

## Troubleshooting

### "Voice recognition not working"
- Make sure you've added funds to your OpenAI account
- Check that `config.ts` has your API key
- Verify microphone permissions are granted

### "Audio not playing"
- Enable "Play in Silent Mode" on iOS
- Check device volume
- Try restarting the app

### "App won't load"
- Run `npx expo start --clear` to clear cache
- Make sure all dependencies are installed: `npm install`
- Restart the Expo server

## API Usage & Costs

This app uses OpenAI APIs:
- **Whisper (Speech-to-Text)**: ~$0.006 per minute (~$0.0003 per 3-second clip)
- **GPT-4o-mini (AI Recognition)**: ~$0.00015 per request
- **TTS (Text-to-Speech)**: ~$0.015 per 1K characters

**Estimated cost per navigation session**: $0.05 - $0.10

## Development

### Project Structure

```
blind_building_navigator/
├── app/                    # App screens
│   ├── index.tsx          # Building selection
│   ├── navigate.tsx       # Room selection & navigation
│   ├── settings.tsx       # Settings page
│   └── _layout.tsx        # Root layout
├── services/              # Core services
│   ├── aiService.ts       # AI recognition
│   ├── voiceService.ts    # Speech-to-text
│   ├── speechService.ts   # Text-to-speech
│   └── navigationService.ts # Route finding
├── contexts/              # State management
│   └── NavigationContext.tsx
└── config.ts             # API configuration
```

### Technologies Used

- **React Native** - Mobile framework
- **Expo** - Development platform
- **NativeWind** - Tailwind CSS for React Native
- **OpenAI Whisper** - Speech recognition
- **OpenAI GPT-4o-mini** - Natural language understanding
- **OpenAI TTS** - Text-to-speech
- **Expo Haptics** - Vibration feedback

## Contributing

Feel free to submit issues or pull requests!

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
