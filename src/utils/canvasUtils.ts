
export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}

export const boundBoxFunc = (oldBox: Box, newBox: Box) => {
    if (newBox.width < 5 || newBox.height < 5) {
        return oldBox;
    }
    return newBox;
};
