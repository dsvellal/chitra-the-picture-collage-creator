import { useCallback } from 'react';
import { useCollageStore } from '../store/collageStore';
import Konva from 'konva';
import { processDroppedImages } from '../utils/imageProcessing';

const parseData = (e: React.DragEvent<HTMLDivElement>) => {
    const srcsJSON = e.dataTransfer.getData('imageSrcs');
    const singleSrc = e.dataTransfer.getData('imageSrc');
    let srcs: string[] | null = null;

    if (srcsJSON) {
        try {
            const parsed = JSON.parse(srcsJSON);
            if (Array.isArray(parsed) && parsed.length > 0) srcs = parsed;
        } catch (e) {
            console.error("Failed to parse image drop", e);
        }
    }
    return { srcs, singleSrc };
};

export const useCanvasDrop = (
    stageRef: React.RefObject<Konva.Stage | null>
) => {
    const { addCollageItem, addCollageItems, collageItems, canvasSettings } = useCollageStore();

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        stage.setPointersPositions(e);
        const pointerPos = stage.getRelativePointerPosition();
        if (!pointerPos) return;

        const { srcs, singleSrc } = parseData(e);

        if (srcs) {
            processDroppedImages(srcs, collageItems, canvasSettings, pointerPos, addCollageItems, addCollageItem);
        } else if (singleSrc) {
            processDroppedImages([singleSrc], collageItems, canvasSettings, pointerPos, addCollageItems, addCollageItem);
        }
    }, [addCollageItem, addCollageItems, collageItems, canvasSettings, stageRef]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return { handleDrop, handleDragOver };
};
