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

## 🛡️ Zero-Compromise Engineering
Chitra is built with an "Engineering First" mindset, ensuring complete reliability, security, and maintainability.

- **100% Test Coverage**: Every line of code, branch, and function is tested. No exceptions.
- **Mutation Tested**: We don't just test code; we test the tests. Using `Stryker`, we verify that 98.5% of logic mutations are caught.
- **Strict Privacy (Offline First)**: Chitra operates centrally in the browser. A strict CI check ensures **no network requests** are ever made by the core logic. Your photos never leave your device.
- **Zero Duplication**: Enforced by `jscpd` with a strict <75 token limit.
- **Cyclomatic Complexity**: All functions are kept simple (complexity score < 5).

## 🚀 Premium Features
Chitra isn't just a simple collage tool; it's a creative workbench.

- **Smart "Picasa" Layouts**: Intelligent algorithms (Mosaic, Grid) automatically arrange photos to fit the canvas perfectly without cropping important details.
- **Pro-Grade Workbench**: A 3-pane interface design inspired by professional tools like Figma and Canva.
- **High-Fidelity Export**: Download collages in 4K resolution (PNG/JPG) with perfect pixel clarity.
- **Advanced Editing**: Full history (Undo/Redo), batch selection, and precise transformations.

## 🔒 Security & Privacy
- **Client-Side Only**: No server processing. Images are processed locally using Canvas API.
- **Dependency Scanning**: Continuous vulnerability auditing via `npm audit` and `eslint-plugin-security`.
- **No Analytics**: We respect your privacy. No tracking scripts or beacons.

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

### Verification
Run the "Zero-Compromise" One-Click Check:
```bash
npm run check:all
```
This single command runs:
1. Linting & Formatting
2. Complexity Analysis
3. Duplication Detection
4. Offline Enforcement
5. 100% Coverage Checks
6. Mutation Testing
7. Spelling & Security Checks
