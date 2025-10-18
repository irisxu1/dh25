# InterviewPrep AI

An AI-powered interview preparation platform that uses voice analysis and facial tracking to help students and professionals improve their interview skills.

## Features

- 🎤 **Voice Analysis**: Detects filler words, measures speaking rate, volume, and clarity
- 👁️ **Facial Tracking**: Monitors eye contact, smile frequency, and confidence levels
- 📊 **Detailed Feedback**: Comprehensive analysis with actionable insights
- 🎯 **Practice Questions**: Curated interview questions for different scenarios
- 📈 **Progress Tracking**: Monitor improvement over time with Statsig analytics
- 🔊 **AI Voice**: ElevenLabs integration for realistic interview simulation

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Voice Analysis**: Web Speech API + Custom algorithms
- **Facial Analysis**: MediaPipe Face Mesh (planned)
- **Analytics**: Statsig
- **AI Voice**: ElevenLabs API
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Camera and microphone access

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd dubhacksmain
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
REACT_APP_STATSIG_CLIENT_KEY=your-statsig-client-key
REACT_APP_ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Setup

### Statsig Setup
1. Sign up at [statsig.com](https://statsig.com)
2. Create a new project
3. Get your client key from the dashboard
4. Add it to your `.env` file

### ElevenLabs Setup
1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Get your API key from the dashboard
3. Add it to your `.env` file

## Usage

1. **Start Practice**: Click "Start Practice Interview" to begin
2. **Allow Permissions**: Grant camera and microphone access
3. **Answer Questions**: Respond to the interview questions naturally
4. **Get Feedback**: Review detailed analysis of your performance
5. **Improve**: Use the feedback to practice and improve

## Project Structure

```
src/
├── components/          # React components
│   ├── InterviewRecorder.tsx
│   └── FeedbackDashboard.tsx
├── hooks/              # Custom React hooks
│   ├── useVoiceAnalysis.ts
│   └── useFacialAnalysis.ts
├── services/           # API services
│   ├── statsigService.ts
│   └── elevenLabsService.ts
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

## Development Roadmap

- [ ] Integrate MediaPipe for advanced facial analysis
- [ ] Add more sophisticated voice analysis algorithms
- [ ] Implement user authentication and progress tracking
- [ ] Add more interview question categories
- [ ] Create mobile-responsive design
- [ ] Add video recording and playback
- [ ] Implement AI-powered interview coaching

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue on GitHub or contact the development team.
