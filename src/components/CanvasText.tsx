import React from 'react';
import { Text, Transformer } from 'react-konva';
import Konva from 'konva';

import type { CollageItem } from '../store/collageStore';
import { getItemStyles } from '../utils/styleUtils';

interface CanvasTextProps {
    item: CollageItem;
    isSelected: boolean;
    onSelect: () => void;
    onChange: (newAttrs: Partial<CollageItem>) => void;
    onDoubleClick?: () => void;
}

import { useCanvasItem } from '../hooks/useCanvasItem';
import { boundBoxFunc } from '../utils/canvasUtils';

// ...

export const CanvasText: React.FC<CanvasTextProps> = ({ item, isSelected, onSelect, onChange, onDoubleClick }) => {
    const { shapeRef, trRef, handleDragEnd, handleTransformEnd } = useCanvasItem<Konva.Text>(isSelected, onChange);
    const styleProps = getItemStyles(item);

    return (
        <>
            <Text
                ref={shapeRef}
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
                onDblClick={onDoubleClick}
                draggable
                // Text Specifics
                text={item.text}
                fontSize={item.fontSize || 20}
                fontFamily={item.fontFamily || 'sans-serif'}
                fill={item.fill || '#000000'}
                fontStyle={item.fontStyle}
                align={item.align}
                // Common
                {...styleProps}
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                rotation={item.rotation}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={boundBoxFunc}
                    enabledAnchors={['middle-left', 'middle-right', 'bottom-right', 'bottom-left', 'top-left', 'top-right']} // Text usually scales better
                />
            )}
        </>
    );
};
