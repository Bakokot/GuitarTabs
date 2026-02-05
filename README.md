# Guitar Tabs App

A modern, offline-first desktop application for guitarists to manage, create, and organize their song collection with interactive tablature and chord editors.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-lightgrey)

## ✨ Features

- **Interactive Tablature Editor**: Create ASCII tabs visually by selecting strings and entering fret numbers (0-24). No more manual formatting!
- **Chords & Lyrics System**: Place chords exactly above the corresponding words in your lyrics with an intuitive "click-to-position" interface.
- **Configurable Storage**: Choose exactly where your song data is stored. Perfect for syncing with Dropbox, Google Drive, or external drives.
- **Automatic Data Migration**: When you change your storage path, the app automatically moves your existing songs to the new location.
- **Modern UI**: Clean, responsive interface built with React and Vanilla CSS.
- **Offline First**: All your data is stored locally on your machine.
- **Search & Organize**: Easily find your favorite songs and organize them by sections.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or later recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/guitar-tabs-app.git
   cd guitar-tabs-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application in development mode:
   ```bash
   npm run dev
   ```

### Building for Production

To create a distributable package for your OS:

```bash
npm run build
```

The installer will be generated in the `dist` directory.

## 🛠️ Technology Stack

- **Core**: [Electron](https://www.electronjs.org/)
- **Frontend**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS
- **Data Storage**: JSON files with custom path management

## 📂 Project Structure

- `electron/`: Main process logic, IPC handlers, and file system management.
- `src/`: Renderer process (React) source code.
  - `components/`: React UI components (Editors, Settings, List, etc.).
  - `types/`: TypeScript interfaces and shared definitions.
  - `App.tsx`: Main application entry and view management.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
