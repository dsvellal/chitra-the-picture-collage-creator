import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Crop as CropIcon } from 'lucide-react';
import type { CollageItem } from '../store/collageStore';

interface CropModalProps {
    item: CollageItem;
    onApply: (crop: { x: number, y: number, width: number, height: number }) => void;
    onCancel: () => void;
}

export const CropModal: React.FC<CropModalProps> = ({ item, onApply, onCancel }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selection, setSelection] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const [imgDims, setImgDims] = useState({ width: 0, height: 0 });

    // Initialize selection to full image or existing crop
    useEffect(() => {
        if (imageLoaded && imgRef.current && containerRef.current) {
            const img = imgRef.current;
            const w = img.clientWidth;
            const h = img.clientHeight;

            setSelection({
                x: w * 0.1,
                y: h * 0.1,
                width: w * 0.8,
                height: h * 0.8
            });
        }
    }, [imageLoaded, item.crop]);


    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setStartPos({ x, y });
        setSelection({ x, y, width: 0, height: 0 });
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const x = Math.min(currentX, startPos.x);
        const y = Math.min(currentY, startPos.y);
        const width = Math.abs(currentX - startPos.x);
        const height = Math.abs(currentY - startPos.y);

        setSelection({ x, y, width, height });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleApply = () => {
        if (!imgRef.current) return;

        // Calculate crop relative to natural image size
        const naturalWidth = imgRef.current.naturalWidth;
        const naturalHeight = imgRef.current.naturalHeight;
        const displayWidth = imgRef.current.clientWidth;
        const displayHeight = imgRef.current.clientHeight;

        const scaleX = naturalWidth / displayWidth;
        const scaleY = naturalHeight / displayHeight;

        const crop = {
            x: selection.x * scaleX,
            y: selection.y * scaleY,
            width: selection.width * scaleX,
            height: selection.height * scaleY
        };

        onApply(crop);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-full max-w-4xl w-full">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <CropIcon size={20} />
                        Crop Image
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-slate-900 relative flex items-center justify-center overflow-hidden p-4 select-none"
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div
                        ref={containerRef}
                        className="relative inline-block"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                    >
                        <img
                            ref={imgRef}
                            src={item.src}
                            alt="Crop target"
                            className="max-h-[60vh] max-w-full object-contain pointer-events-none"
                            onLoad={(e) => {
                                setImageLoaded(true);
                                setImgDims({
                                    width: e.currentTarget.clientWidth,
                                    height: e.currentTarget.clientHeight
                                });
                            }}
                        />

                        {/* Overlay helpers */}
                        {imageLoaded && (
                            <>
                                <div className="absolute inset-0 bg-black/50 pointer-events-none" />
                                <div
                                    className="absolute border-2 border-white shadow-sm pointer-events-none bg-transparent"
                                    style={{
                                        left: selection.x,
                                        top: selection.y,
                                        width: selection.width,
                                        height: selection.height,
                                        backgroundImage: `url(${item.src})`, // Trick to show clear image
                                        backgroundPosition: `-${selection.x}px -${selection.y}px`,
                                        backgroundSize: `${imgDims.width}px ${imgDims.height}px`
                                    }}
                                >
                                    {/* Thirds grid */}
                                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                                        <div className="border-r border-b border-white"></div>
                                        <div className="border-r border-b border-white"></div>
                                        <div className="border-b border-white"></div>
                                        <div className="border-r border-b border-white"></div>
                                        <div className="border-r border-b border-white"></div>
                                        <div className="border-b border-white"></div>
                                        <div className="border-r border-white"></div>
                                        <div className="border-r border-white"></div>
                                        <div></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg flex items-center gap-2"
                    >
                        <Check size={18} />
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
};
