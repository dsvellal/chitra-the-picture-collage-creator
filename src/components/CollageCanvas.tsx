import React from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { useCollageStore } from '../store/collageStore';
import { CanvasImage } from './CanvasImage';
import { CanvasText } from './CanvasText';
import { FileDown, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import Konva from 'konva';

import { useCanvasDrop } from '../hooks/useCanvasDrop';
import { useItemInteraction } from '../hooks/useItemInteraction';
import { useCanvasZoom } from '../hooks/useCanvasZoom';
import { useCanvasShortcuts } from '../hooks/useCanvasShortcuts';

interface CollageCanvasProps {
    stageRef: React.RefObject<Konva.Stage | null>;
    onEditRequest?: (id: string) => void;
}

export const CollageCanvas: React.FC<CollageCanvasProps> = ({ stageRef, onEditRequest }) => {
    const {
        collageItems,
        canvasSettings,
        updateCollageItem,
        selectedItemId,
        setSelectedItemId,
    } = useCollageStore();

    const { zoom, handleZoom, setZoom, containerRef } = useCanvasZoom();
    useCanvasShortcuts();
    const { handleDrop, handleDragOver } = useCanvasDrop(stageRef);
    const { handleItemChange } = useItemInteraction();

    const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedItemId(null);
        }
    };

    return (
        <div
            ref={containerRef}
            className="h-full flex-1 relative flex overflow-auto bg-slate-950/50 custom-scrollbar"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <div className="min-w-full min-h-full flex items-center justify-center p-20">
                <div
                    className="shadow-2xl shadow-black/50 ring-1 ring-white/10 bg-white transition-all duration-200"
                    style={{
                        width: canvasSettings.width * zoom,
                        height: canvasSettings.height * zoom
                    }}
                >
                    <Stage
                        width={canvasSettings.width * zoom}
                        height={canvasSettings.height * zoom}
                        scale={{ x: zoom, y: zoom }}
                        onMouseDown={checkDeselect}
                        onTouchStart={checkDeselect}
                        ref={stageRef}
                        style={{ background: canvasSettings.backgroundColor }}
                    >
                        <Layer>
                            <Rect
                                width={canvasSettings.width}
                                height={canvasSettings.height}
                                fill={canvasSettings.backgroundColor}
                                listening={false}
                            />

                            {collageItems.map((item) => {
                                if (item.type === 'text') {
                                    return (
                                        <CanvasText
                                            key={item.id}
                                            item={item}
                                            isSelected={item.id === selectedItemId}
                                            onSelect={() => setSelectedItemId(item.id)}
                                            onChange={(newAttrs) => updateCollageItem(item.id, newAttrs)}
                                            onDoubleClick={() => {
                                                const newText = prompt("Edit Text:", item.text);
                                                if (newText !== null && newText !== item.text) {
                                                    updateCollageItem(item.id, { text: newText });
                                                }
                                            }}
                                        />
                                    );
                                }
                                return (
                                    <CanvasImage
                                        key={item.id}
                                        item={item}
                                        isSelected={item.id === selectedItemId}
                                        onSelect={() => setSelectedItemId(item.id)}
                                        onChange={(newAttrs) => handleItemChange(item, newAttrs)}
                                        onDoubleClick={onEditRequest ? () => onEditRequest(item.id) : undefined}
                                    />
                                );
                            })}
                        </Layer>
                    </Stage>
                </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur border border-white/10 p-1.5 rounded-full flex items-center gap-1 shadow-xl z-20">
                <button onClick={() => handleZoom(-0.1)} className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition">
                    <ZoomOut size={16} />
                </button>
                <span className="w-12 text-center text-xs font-mono font-medium text-slate-300">{Math.round(zoom * 100)}%</span>
                <button onClick={() => handleZoom(0.1)} className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition">
                    <ZoomIn size={16} />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button onClick={() => setZoom(1)} className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition" title="Reset Zoom">
                    <Maximize size={14} />
                </button>
            </div>

            {collageItems.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-slate-900/90 backdrop-blur p-8 rounded-3xl shadow-2xl border border-white/10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 border border-indigo-500/20">
                            <FileDown size={40} className="text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Start Creating</h3>
                        <p className="text-slate-400">Drag photos from the library here</p>
                    </div>
                </div>
            )}
        </div>
    );
};
