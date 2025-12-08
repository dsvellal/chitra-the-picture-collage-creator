import { useState, useRef, useCallback, useEffect } from 'react';

export const useCanvasZoom = () => {
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleZoom = (delta: number) => {
        setZoom(prev => Math.max(0.1, Math.min(5, prev + delta)));
    };

    const handleWheel = useCallback((e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const scaleBy = 1.1;
            const newZoom = e.deltaY < 0 ? zoom * scaleBy : zoom / scaleBy;
            setZoom(Math.max(0.1, Math.min(5, newZoom)));
        }
    }, [zoom]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            return () => container.removeEventListener('wheel', handleWheel);
        }
    }, [handleWheel]);

    return { zoom, setZoom, handleZoom, containerRef };
};
