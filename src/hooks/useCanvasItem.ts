import { useRef, useEffect } from 'react';
import Konva from 'konva';
import type { CollageItem } from '../types';

export const useCanvasItem = <T extends Konva.Shape>(
    isSelected: boolean,
    onChange: (updates: Partial<CollageItem>) => void
) => {
    const shapeRef = useRef<T>(null);
    const trRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
        if (isSelected) {
            trRef.current?.nodes([shapeRef.current!]);
            trRef.current?.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        onChange({ x: e.target.x(), y: e.target.y() });
    };

    const handleTransformEnd = () => {
        const node = shapeRef.current;
        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        onChange({
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            scale: 1,
        });
    };

    return {
        shapeRef,
        trRef,
        handleDragEnd,
        handleTransformEnd
    };
};
