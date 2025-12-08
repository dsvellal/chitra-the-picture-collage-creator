import React, { useEffect } from 'react';
import { Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import type { CollageItem } from '../store/collageStore';
import { getItemStyles } from '../utils/styleUtils';
import { useCollageStore } from '../store/collageStore';
import { useCanvasItem } from '../hooks/useCanvasItem';
import { boundBoxFunc } from '../utils/canvasUtils';

interface CanvasImageProps {
    item: CollageItem;
    isSelected: boolean;
    onSelect: () => void;
    onChange: (newAttrs: Partial<CollageItem>) => void;
    onDoubleClick?: () => void;
}


// ...

export const CanvasImage: React.FC<CanvasImageProps> = ({ item, isSelected, onSelect, onChange, onDoubleClick }) => {
    const [image] = useImage(item.src || '', 'anonymous');
    const { shapeRef, trRef, handleDragEnd, handleTransformEnd } = useCanvasItem<Konva.Image>(isSelected, onChange);
    const globalBorderRadius = useCollageStore((state) => state.canvasSettings.borderRadius);
    const borderRadius = item.borderRadius ?? globalBorderRadius;

    useEffect(() => {
        if (isSelected) {
            trRef.current?.nodes([shapeRef.current!]);
            trRef.current?.getLayer()?.batchDraw();
        }
    }, [isSelected, shapeRef, trRef]);

    // Apply filters and cache when properties change
    useEffect(() => {
        if (shapeRef.current) {
            shapeRef.current.cache();
            shapeRef.current.getLayer()?.batchDraw();
        }
    }, [image, borderRadius, item.width, item.height, item.crop, item.filter, item.borderColor, item.borderWidth, shapeRef]);


    const styleProps = getItemStyles(item);

    return (
        <>
            <Image
                ref={shapeRef}
                image={image}
                onClick={onSelect}
                onTap={onSelect} // mobile support
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
                onDblClick={onDoubleClick}
                draggable
                {...styleProps}
                // Specifics
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                rotation={item.rotation}

                // Styles not handled by getItemStyles
                cornerRadius={borderRadius}
                stroke={item.borderColor}
                strokeWidth={item.borderWidth}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={boundBoxFunc}
                />
            )}
        </>
    );
};
