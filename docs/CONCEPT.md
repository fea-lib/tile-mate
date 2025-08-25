# 🧩 TileMate: Tileset Creation & Management Tool

## 🔄 Project Evolution
TileMate began as a simple idea to make tileset management accessible and intuitive for both hobbyists and professionals. The initial concept focused on basic tile selection and manipulation, but quickly expanded to include touch support, flexible grid configuration, and a vision for extensibility. Early on, the decision was made to prioritize a static, browser-based tool for maximum accessibility and ease of deployment.

## 🚀 Project Genesis & Motivation
The motivation for TileMate arose from the frustration of using heavyweight or overly complex tools for simple tileset tasks. The goal: empower users to load, create, and manage tilesets with minimal friction, directly in the browser, with a focus on usability and rapid iteration. Inspirations include classic pixel art editors and the desire to support both mouse and touch workflows.

## 📝 Project Overview
TileMate is a web-based tool for creating and managing tilesets. It supports loading standard image formats, configuring grid and tile sizes, and performing common tile operations (copy, cut, paste, move, etc.) with both mouse and touch input. Designed for game developers, artists, and educators, it aims to be the fastest way to get started with tileset management—no installation required.

## 💡 Core Ideas & Features
- Touch and mouse input support
- Load tileset images (PNG, JPEG)
- Create new blank tilesets
- Configure grid/tile size
- Toggleable grid lines overlay
- Highlight tiles on hover
- Select and manage tiles (copy, cut, paste, append, prepend, swap, move pixel-by-pixel)
- Static web app, deployable to GitHub Pages

## 🧩 Design Decisions & Rationale
- **Web-based, static app:** Chosen for accessibility and ease of deployment. No backend required.
- **PNG/JPEG support:** These are the most common and widely supported formats for tilesets. Other formats (GIF, WebP) may be considered later.
- **No built-in tile editing (v1.0):** Focus is on management, not pixel editing, to keep the tool lightweight and focused.
- **No hard performance limits:** Users are free to experiment; optimizations will be addressed as needed.
- **Pointer events:** Unified handling for mouse and touch simplifies code and UX.

## ❌ Rejected Ideas & Alternatives
- **Backend integration:** Dropped to keep the tool static and easy to host.
- **In-app tile drawing/editing:** Deferred to a future version to avoid scope creep.
- **Strict tileset size limits:** Not enforced; users will self-regulate based on performance.

## 🔮 Future requirements
- **Tile Metadata & Export:**
  - Add and edit descriptions, names, and tags for each tile.
  - Export tileset data and metadata in standard formats (e.g., Aseprite JSON) for use in game engines and other tools.
- **Multi-Tile Selection & Manipulation:**
  - Select multiple tiles at once (rectangle/lasso or shift+click).
  - Apply actions (copy, cut, paste, move, swap, etc.) to multiple tiles simultaneously.
  - Enhanced UI for managing and visualizing multi-tile selections.
- **In-app Tile Drawing/Editing:**
  - Draw, erase, and modify individual tiles directly within the app.
  - Provide basic pixel art editing tools (pencil, eraser, color picker, etc.).
  - Support undo/redo for tile edits.

These features will expand TileMate's capabilities for advanced workflows and integration with external tools.

## 💬 Key Conversation Excerpts
> "Support touch and mouse input. Load tileset image. Create new tilesets. Configure grid/tile size. Toggleable grid lines overlay. Highlight tiles on mouse over. Select tiles (and highlight selected). Manage selected tile: Copy, Cut, Paste, Append, Prepend, Swap, Move pixel by pixel."

> "For v1.0, support PNG and JPEG. Optionally, allow GIF and WebP if browser support is easy to add, but not required."

> "Just a static web site, no backend integration. Hosted on Github pages for now."

## 🎨 UI

### Desktop Wireframe

```
+-----------------------------------------------------------------------------------+
| 🧩 TileMate         [New] [Open] [Export] [Settings]                              |
+---------------------+-------------------------------------------------------------+
|  Sidebar            |                                                             |
|  [Tile Actions]     |                  Tileset Canvas                             |
|  [Drawing Tools]    |   +-----------------------------------------------+         |
|  [Tile Metadata]    |   |                                               |         |
|  (Collapsible)      |   |   [Grid Overlay]   [Tile Selection]           |         |
|                     |   |                                               |         |
|                     |   +-----------------------------------------------+         |
+---------------------+-------------------------------------------------------------+
| [Undo] [Redo] [Zoom] [Grid Toggle] (optional bottom bar or floating buttons)      |
+-----------------------------------------------------------------------------------+
```

- **Sidebar**: Always visible on the left, collapsible for more canvas space.
- **Top Bar**: Main actions, always accessible.
- **Canvas**: Centered, large, supports mouse and keyboard shortcuts.
- **Bottom Bar**: Quick actions (optional, can be floating).

### Mobile Wireframe

```
+------------------------------------------------------+
| 🧩 TileMate   [≡] [New] [Open] [Export] [Settings]   |
+------------------------------------------------------+
|                                                      |
|                Tileset Canvas                        |
|   +--------------------------------------------+     |
|   |                                            |     |
|   |   [Grid Overlay]   [Tile Selection]        |     |
|   |                                            |     |
|   +--------------------------------------------+     |
|                                                      |
+------------------------------------------------------+
| [Tile Actions] [Drawing Tools] [Metadata] (Drawer)   |
| [Undo] [Redo] [Zoom] [Grid] (Bottom bar, large btns) |
+------------------------------------------------------+
```

- **Sidebar**: Becomes a bottom drawer or floating action button for actions/tools.
- **Top Bar**: Compact, with hamburger menu for settings and file actions.
- **Canvas**: Fills most of the screen, supports pinch-to-zoom and pan.
- **Bottom Bar**: Large, touch-friendly quick actions.

### UX improvements

#### General
- Minimize the number of taps/clicks required for common actions.
- Use context-aware floating action bars and popovers instead of static toolbars.
- Provide haptic feedback (on supported devices) for key actions (select, copy, paste, error).

#### Desktop Shortcuts
- **Arrow keys:** Move selection
- **Ctrl/Cmd + C/X/V:** Copy/Cut/Paste
- **Z/Y:** Undo/Redo
- **G:** Toggle grid
- **D:** Draw mode
- **E:** Eraser mode

#### Mobile Touch Navigation & Gestures
- **Tap:** Select tile
- **Double-tap:** Quick action (e.g., open tile editor or metadata)
- **Long-press:** Open context menu with all available actions for the tile/selection
- **Pinch:** Zoom in/out of the canvas
- **Two-finger drag:** Pan the canvas
- **Swipe left/right (two fingers):** Undo/redo
- **Floating Action Button (FAB):** Expands to show most-used actions; customizable
- **Contextual Action Bar:** Appears near selection with only the most relevant actions (copy, cut, paste, draw, etc.)
- **Auto-advance:** After placing or editing a tile, auto-advance the selection to the next logical tile

#### Summary Table

| Action       | Gesture/Button        | UX Enhancement             |
| ------------ | --------------------- | -------------------------- |
| Select tile  | Tap                   | Fast, direct               |
| Quick action | Double-tap            | No menu needed             |
| Context menu | Long-press            | All actions, less clutter  |
| Pan/Zoom     | Two-finger drag/pinch | No UI needed               |
| Undo/Redo    | Two-finger swipe      | No button needed           |
| More actions | FAB or swipe on bar   | Customizable, always handy |

### Multi-Tileset Management

#### Overview
TileMate supports working with at least two tilesets in parallel, enabling efficient management and transfer of tiles between them.

#### Desktop
- **Dual Tileset View:** Split the main canvas area horizontally or vertically to show two tilesets side by side.
- **Drag-and-drop:** Move or copy tiles between tilesets by dragging.
- **Copy/Move Actions:** Select tile(s) in one tileset, use copy/move, then paste into the other.
- **Tabs or Selectors:** Tabs or dropdowns to switch/add/remove tilesets.

```
+-------------------+-------------------+
| Tileset A         | Tileset B         |
| [Grid, actions]   | [Grid, actions]   |
| [Selection]       | [Selection]       |
+-------------------+-------------------+
| [Copy] [Move] [Paste] [Sync]          |
+---------------------------------------+
```

#### Mobile
- **Tabs or Swipe:** Use tabs or swipe gesture to switch between tilesets.
- **Send to Other Tileset:** Contextual action bar includes “Send to other tileset” for quick transfer.
- **Split View (Tablet):** Optionally, show both tilesets in landscape mode on tablets.

```
+--------------------------------+
| [Tileset A] [B]                |  <-- Tabs
+--------------------------------+
| Tileset Canvas                 |
| [Grid, actions]                |
+--------------------------------+
| [Copy to B] [Move to B] [Sync] |
+--------------------------------+
```

#### Additional Features
- **Visual Feedback:** Highlight source and destination tilesets during transfer; show a “ghost” tile when dragging.
- **Sync Actions:** “Sync grid size” or “Match palette” between tilesets for easier transfer.

## 🏗️ Architecture & Structure

### Single-Tool Approach
To ensure a consistent, high-performance UX for both canvas and UI, the app should be built with a single core technology that handles both imperative canvas work and declarative UI. This avoids the complexity of bridging two frameworks (e.g., React for UI, Phaser for canvas) and enables unified state and event handling.

### Top Frameworks/Libraries for TileMate

| Framework      | Pros                                                                  | Cons                                                    | Rating    |
| -------------- | --------------------------------------------------------------------- | ------------------------------------------------------- | --------- |
| **SolidJS**    | Extremely fast, fine-grained reactivity, simple, small bundle, modern | Smaller ecosystem than React, fewer mature UI libs      | ★★★★★ (1) |
| **Svelte**     | Compiles to efficient JS, reactive, easy, great for UI+canvas         | Slightly less mainstream, some advanced patterns unique | ★★★★☆ (2) |
| **Phaser.js**  | Game engine, great for canvas, input, asset mgmt                      | UI overlays less flexible, not web-app idiomatic        | ★★★★☆ (3) |
| **React**      | Huge ecosystem, familiar, good for UI                                 | Canvas perf needs care, not as snappy for heavy canvas  | ★★★☆☆ (4) |
| **Million.js** | React-like, focused on perf, small                                    | Newer, smaller ecosystem, less docs/examples            | ★★★☆☆ (5) |

**Recommendation:**
- For a modern, maintainable, and high-performance app, use **SolidJS** or **Svelte**. Both allow unified, fast, and flexible code for UI and canvas.
- **Phaser.js** is best if you want a game-engine feel and can accept less HTML/CSS UI flexibility.
- **React** is viable if you value ecosystem and are comfortable optimizing canvas interactions.

### Typical Stack (if using SolidJS/Svelte/React)
- **Frontend:** SolidJS, Svelte, or React (with TypeScript)
- **Rendering:** HTML5 Canvas API for tileset, grid, and effects
- **State Management:** Built-in (Solid/Svelte) or lightweight store (Zustand, Context)
- **File Handling:** FileReader API for image import/export
- **UI:** Canvas for tileset, component-based UI for menus, tabs, actions, etc.

## 💻 Code Snippets & Examples

### SolidJS POC

```jsx
import {
  createSignal,
  createEffect,
  onCleanup,
} from "https://cdn.skypack.dev/solid-js";
import { render } from "https://cdn.skypack.dev/solid-js/web";

const TILE_SIZE = 32;
const GRID_COLOR = "rgba(0,0,0,0.2)";

function App() {
  const [image, setImage] = createSignal(null);
  const [tileset, setTileset] = createSignal(null);
  const [selected, setSelected] = createSignal(null); // {x, y}
  const [dragging, setDragging] = createSignal(null); // {from: {x, y}, to: {x, y}}
  let canvas, ctx;
  let cols = 0,
    rows = 0;

  // Load image from file input
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      cols = Math.floor(img.width / TILE_SIZE);
      rows = Math.floor(img.height / TILE_SIZE);
      setTileset({ cols, rows, width: img.width, height: img.height });
      draw();
    };
    img.src = URL.createObjectURL(file);
  }

  // Draw everything
  function draw(highlight) {
    if (!ctx || !image()) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image(), 0, 0);
    // Draw grid
    ctx.save();
    ctx.strokeStyle = GRID_COLOR;
    for (let x = 0; x <= image().width; x += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, image().height);
      ctx.stroke();
    }
    for (let y = 0; y <= image().height; y += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(image().width, y);
      ctx.stroke();
    }
    ctx.restore();
    // Highlight selected
    if (selected()) {
      ctx.save();
      ctx.strokeStyle = "#2196f3";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selected().x * TILE_SIZE,
        selected().y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
      ctx.restore();
    }
    // Highlight drag target
    if (highlight) {
      ctx.save();
      ctx.strokeStyle = "#4caf50";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        highlight.x * TILE_SIZE,
        highlight.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
      ctx.restore();
    }
  }

  // Get tile under mouse
  function getTile(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    return { x, y };
  }

  // Mouse/touch events
  function handleDown(e) {
    if (!image()) return;
    const tile = getTile(e.touches ? e.touches[0] : e);
    setSelected(tile);
    setDragging({ from: tile, to: tile });
  }
  function handleMove(e) {
    if (!dragging()) return;
    const tile = getTile(e.touches ? e.touches[0] : e);
    setDragging({ ...dragging(), to: tile });
    draw(tile);
  }
  function handleUp(e) {
    if (!dragging()) return;
    const from = dragging().from;
    const to = dragging().to;
    if (from.x !== to.x || from.y !== to.y) {
      // Copy tile image data from 'from' to 'to'
      const imgData = ctx.getImageData(
        from.x * TILE_SIZE,
        from.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
      ctx.clearRect(to.x * TILE_SIZE, to.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.putImageData(imgData, to.x * TILE_SIZE, to.y * TILE_SIZE);
    }
    setSelected(to);
    setDragging(null);
    draw();
  }

  createEffect(() => {
    if (canvas && image()) {
      canvas.width = image().width;
      canvas.height = image().height;
      ctx = canvas.getContext("2d");
      draw();
    }
  });

  // Clean up event listeners
  onCleanup(() => {
    if (canvas) {
      canvas.onmousedown = null;
      canvas.onmousemove = null;
      canvas.onmouseup = null;
      canvas.ontouchstart = null;
      canvas.ontouchmove = null;
      canvas.ontouchend = null;
    }
  });

  // Attach event listeners
  function setupCanvas(el) {
    canvas = el;
    ctx = canvas.getContext("2d");
    canvas.onmousedown = handleDown;
    canvas.onmousemove = handleMove;
    canvas.onmouseup = handleUp;
    canvas.ontouchstart = (e) => {
      e.preventDefault();
      handleDown(e);
    };
    canvas.ontouchmove = (e) => {
      e.preventDefault();
      handleMove(e);
    };
    canvas.ontouchend = (e) => {
      e.preventDefault();
      handleUp(e);
    };
  }

  return (
    <div>
      <div class="toolbar">
        <input type="file" accept="image/*" onInput={handleFile} />
        <span style="margin-left:1em; color:#888">
          Tile size: {TILE_SIZE}px
        </span>
      </div>
      <canvas ref={setupCanvas} style="touch-action:none;" />
    </div>
  );
}

render(() => <App />, document.getElementById("app"));
```

## 📚 References & Inspirations
- Classic pixel art editors (Aseprite, Piskel)
- HTML5 Canvas API
- GitHub Pages for static hosting

## ❓ Open Questions & Next Steps
- Should GIF/WebP be supported in v1.0?
- What UI framework (React, plain JS, etc.) is preferred?
- Add wireframes and initial UI sketches
- Begin implementation of image loading and grid overlay

## 🔗 Full Conversation Reference
- See colocated `logs.json` for the full conversation history.
