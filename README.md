# Figma Persona Lab

A React application for designers to upload UI screenshots and get instant AI-powered feedback from simulated personas using Google Gemini API.

## Features

- 🎭 **Multiple Personas**: Choose from 4 pre-defined personas or create custom ones
- 🖼️ **Image Analysis**: Upload UI screenshots via drag-and-drop or file picker
- 🔴 **Visual Feedback**: See issues marked with interactive red dots on your design
- 📊 **Detailed Reports**: Get actionable UX recommendations with severity levels
- 🔑 **Client-Side API**: Direct integration with Google Gemini API (no backend needed)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. Open the app in your browser (typically http://localhost:5173)
2. Click the Settings icon and enter your Google Gemini API key
3. Select a persona from the sidebar
4. Upload a UI screenshot
5. Click "Start Analysis"
6. Review the issues highlighted on your design

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Google Gemini 1.5 Flash** for AI analysis

## Project Structure

```
figma-persona-lab/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx          # Persona selector
│   │   ├── Canvas.jsx            # Image upload and overlay
│   │   ├── AnalysisPanel.jsx     # Results display
│   │   └── SettingsModal.jsx     # API key settings
│   ├── App.jsx                   # Main application
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## License

MIT
