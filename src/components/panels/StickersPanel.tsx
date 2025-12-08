import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { useCollageStore } from '../../store/collageStore';
import clsx from 'clsx';

export const StickersPanel = () => {
    const { addCollageItem, canvasSettings } = useCollageStore();
    const [category, setCategory] = useState<'emojis' | 'shapes'>('emojis');

    const addEmoji = (emoji: string) => {
        addCollageItem({
            id: uuidv4(),
            type: 'text',
            text: emoji,
            x: canvasSettings.width / 2,
            y: canvasSettings.height / 2,
            width: 100,
            height: 100,
            originalWidth: 100,
            originalHeight: 100,
            rotation: 0,
            scale: 1,
            zIndex: 100,
            fontSize: 80,
            fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif',
            fill: '#000000',
        });
    };

    const addShape = (svgString: string) => {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        addCollageItem({
            id: uuidv4(),
            type: 'image',
            src: url,
            x: canvasSettings.width / 2,
            y: canvasSettings.height / 2,
            width: 150,
            height: 150,
            originalWidth: 150,
            originalHeight: 150,
            rotation: 0,
            scale: 1,
            zIndex: 100,
        });
    };

    const shapes = [
        { name: 'Circle', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#6366f1" /></svg>' },
        { name: 'Star', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50 5 61 35 95 35 68 57 79 91 50 70 21 91 32 57 5 35 39 35" fill="#fbbf24" /></svg>' },
        { name: 'Heart', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 88.9L16.7 55.6C7.2 46.1 7.2 30.9 16.7 21.4s24.7-9.5 33.3 0L50 21.4l0.1-0.1c8.7-9.5 23.8-9.5 33.3 0s9.5 24.7 0 34.2L50 88.9z" fill="#f43f5e" /></svg>' },
        { name: 'Square', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="10" fill="#10b981" /></svg>' },
    ];

    const emojis = ['😎', '😍', '🎉', '🔥', '❤️', '🌟', '🐶', '🍕', '🚀', '💡', '🌈', '🎁', '👍', '👋', '🦄', '🥥'];

    return (
        <div className="flex flex-col h-full p-4">
            <div className="flex bg-slate-800 rounded-lg p-1 mb-4">
                <button
                    onClick={() => setCategory('emojis')}
                    className={clsx("flex-1 py-1.5 text-xs font-medium rounded-md transition", category === 'emojis' ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white")}
                >
                    Emojis
                </button>
                <button
                    onClick={() => setCategory('shapes')}
                    className={clsx("flex-1 py-1.5 text-xs font-medium rounded-md transition", category === 'shapes' ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white")}
                >
                    Shapes
                </button>
            </div>

            <div className="grid grid-cols-4 gap-3 overflow-y-auto custom-scrollbar content-start">
                {category === 'emojis' && emojis.map(e => (
                    <button
                        key={e}
                        onClick={() => addEmoji(e)}
                        className="aspect-square flex items-center justify-center text-3xl hover:bg-white/10 rounded-xl transition"
                    >
                        {e}
                    </button>
                ))}

                {category === 'shapes' && shapes.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => addShape(s.svg)}
                        className="aspect-square flex items-center justify-center p-2 hover:bg-white/10 rounded-xl transition group"
                        title={s.name}
                    >
                        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(s.svg)}`} alt={s.name} className="w-full h-full drop-shadow-sm group-hover:scale-110 transition-transform" />
                    </button>
                ))}
            </div>
        </div>
    );
};
