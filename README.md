# 🧩 TileMate

TileMate is a web-based tool for creating and managing tilesets. Built with SolidJS and designed for game developers, artists, and educators, it provides an intuitive interface for tileset management directly in the browser - no installation required.

## 🌐 Live Demos

Try TileMate right now without any installation:

- **🎮 TileMate App**: [https://fea-lib.github.io/tile-mate/](https://fea-lib.github.io/tile-mate/)
- **📖 Documentation**: [https://fea-lib.github.io/tile-mate/docs/](https://fea-lib.github.io/tile-mate/docs/)

## ✨ Features

- **Touch and Mouse Support**: Works seamlessly on desktop and mobile devices
- **Image Import**: Load tileset images (PNG, JPEG) or create new blank tilesets
- **Grid Configuration**: Configurable grid and tile sizes with toggleable grid overlay
- **Tile Management**: Copy, cut, paste, move, and swap tiles with drag-and-drop support
- **Tile Tinting**: Double‑click a tile to choose a tint color with live preview; tints are preserved in exports
- **Multi-Tileset Support**: Work with multiple tilesets simultaneously
- **Tileset Removal**: Remove tilesets you no longer need with a single click
- **Export Options**: Save tilesets in PNG or JPEG format
- **Static Web App**: No backend required, deployable to GitHub Pages

## 🚀 Getting Started

### Prerequisites

- Node.js (18+)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fea-lib/tile-mate.git
cd tile-mate
```

2. Install dependencies:
```bash
cd apps/tile-mate
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## 📚 Available Scripts

### TileMate App (`apps/tile-mate`)

| Script  | Command         | Description                              |
| ------- | --------------- | ---------------------------------------- |
| `start` | `npm start`     | Start development server (alias for dev) |
| `dev`   | `npm run dev`   | Start development server with hot reload |
| `build` | `npm run build` | Build the app for production             |
| `serve` | `npm run serve` | Preview the production build locally     |

### Documentation (`apps/docs`)

| Script    | Command           | Description                        |
| --------- | ----------------- | ---------------------------------- |
| `dev`     | `npm run dev`     | Start Astro development server     |
| `build`   | `npm run build`   | Build documentation for production |
| `preview` | `npm run preview` | Preview the built documentation    |
| `test`    | `npm run test`    | Run tests with Vitest              |

## 🏗️ Project Structure

```
tile-mate/
├── apps/
│   ├── tile-mate/          # Main SolidJS application
│   │   ├── src/
│   │   │   ├── tileset-editor/   # Core tileset editing components
│   │   │   ├── store/            # Application state management
│   │   │   ├── common/           # Reusable UI components
│   │   │   └── types/            # TypeScript type definitions
│   │   └── package.json
│   └── docs/               # Astro-based documentation site
│       ├── src/
│       ├── example-docs/
│       └── package.json
├── docs/
│   └── CONCEPT.md          # Project concept and design decisions
└── LICENSE
```

## 🎮 Usage

1. **Create a New Tileset**: Click "New Tileset" to either load an image or create a blank tileset
2. **Configure Grid**: Adjust tile size, columns, and rows to match your needs
3. **Select Tiles**: Click on tiles to select them, or drag to move/copy tiles
4. **Choose Mode**: Switch between Copy, Move, or Swap modes for different tile operations
5. **Grid Overlay**: Toggle grid lines and adjust gap/color for better visibility
6. **Tint Tiles (optional)**: Double‑click any tile to open the tint dialog, pick a color, preview changes, and Accept to apply (use Clear to remove the tint)
8. **Remove a Tileset**: Click the "Remove" button in a tileset's header to delete it (indices of remaining tilesets are re-indexed)
7. **Export**: Save your tileset as PNG or JPEG; tinted tiles are baked into the exported image

## 🛠️ Technology Stack

- **Frontend**: SolidJS, TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules, Tailwind CSS
- **Documentation**: Astro, MDX
- **Package Manager**: npm

## 🎨 Design Philosophy

TileMate prioritizes:
- **Accessibility**: Works in any modern browser without installation
- **Simplicity**: Focused on tileset management, not pixel editing
- **Performance**: Lightweight and responsive interface
- **Usability**: Intuitive workflow for both beginners and professionals

## 🔮 Future Features

- **Tile Metadata & Export**: Add descriptions, names, and tags to tiles with standard format export
- **Multi-Tile Selection**: Select and manipulate multiple tiles simultaneously
- **In-app Drawing Tools**: Basic pixel art editing capabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for the game development community
