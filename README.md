# Chitra: Premium Collage Creator

A professional-grade, browser-based collage creator built with React, TypeScript, and Konva.

## Features

### Core Editing
- **Drag & Drop Upload**: Easily add images from your computer.
- **Canvas Manipulation**: Move, resize, rotate, and crop images.
- **Text & Stickers**: Add rich text and decorative elements.
- **Undo/Redo**: Full history support for all actions.
- **Multi-Selection**: Select and manipulate multiple items at once (Shift+Click).

### Layout Modes
- **Free**: Place items anywhere.
- **Grid**: Automatically arranges items in a structured grid.
- **Mosaic**: Smart "Picasa-style" packing algorithm that respects aspect ratios.
- **Shuffle**: Instantly randomize layouts for fresh ideas.

### Customization
- **Canvas Presets**: One-click resizing for Instagram, Stories, A4 Print, etc.
- **Styling**: Adjust corner rounding, borders, shadows, and background colors.
- **Photo Filters**: Brightness, Contrast, Grayscale, and more.

## Quality & Architecture
This project adheres to strict code quality standards:
- **Zero Duplication**: Enforced by `jscpd` (0% tolerance).
- **Complexity Limits**: Functions cap at cyclomatic complexity of 5.
- **Test Coverage**: >98% unit test coverage.
- **Mutation Testing**: Critical paths verified with Stryker.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Development
Start the dev server:
```bash
npm run dev
```

### Build
Create a production build:
```bash
npm run build
```

### Quality Checks
Run the full verification suite:
```bash
npm run check:all
```
