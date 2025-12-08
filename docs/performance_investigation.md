# Performance Investigation: OffscreenCanvas & Web Workers

## Objective
Investigate the feasibility of using `OffscreenCanvas` and Web Workers to unblock the main thread during high-resolution exports (e.g., 4K/8K images).

## Findings
Konva.js operations, including `toDataURL`, are synchronous and run on the main thread. For simple collages, this is negligible (<50ms). However, for `pixelRatio: 4` (high-res print), generation can take 500ms-2s, freezing the UI.

### Solution: Web Workers + OffscreenCanvas
Moving the export logic to a Web Worker allows the main thread to remain responsive (showing a progress bar or spinner) while the heavy lifting happens in the background.

#### Challenges
1.  **DOM Access**: Web Workers do not have access to the DOM. Konva relies on `document.createElement('canvas')`.
2.  **Image Loading**: Images (blobs/URLs) must be loaded *inside* the worker or transferred via `ImageBitmap`.
3.  **Konva Compatibility**: Konva has experimental support but requires monkey-patching `Konva.Util.createCanvasElement` to use `new OffscreenCanvas()` instead of `document.createElement`.

## Proposed Architecture (V2)

1.  **Serialization**: Main thread serializes the Stage to JSON: `const json = stage.toJSON()`.
2.  **Worker Transfer**: Send JSON and Asset Blobs to Worker.
3.  **Worker Rehydration**:
    *   Worker receives JSON.
    *   Monkey-patches Konva to use `OffscreenCanvas`.
    *   Recreates Stage: `Konva.Node.create(json)`.
    *   Loads images.
4.  **Export**: Calls `stage.toDataURL()` in the worker.
5.  **Result**: Worker sends `Blob` back to Main thread.
6.  **Save**: Main thread saves Blob (using `FileSystemService`).

## Recommendation
For the current release ("Phase 12"), the performance is acceptable for typical 1080p-4K use cases. Implementing the Worker architecture is recommended for **Phase 15 (Enterprise/Print Features)** as it introduces significant complexity around asset management and synchronization.
