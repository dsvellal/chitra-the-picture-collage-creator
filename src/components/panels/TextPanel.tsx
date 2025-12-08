import { v4 as uuidv4 } from 'uuid';
import { useCollageStore } from '../../store/collageStore';

export const TextPanel = () => {
    const { addCollageItem, canvasSettings } = useCollageStore();

    const addText = (text: string, fontSize: number) => {
        addCollageItem({
            id: uuidv4(),
            type: 'text',
            text: text,
            x: canvasSettings.width / 2 - 100,
            y: canvasSettings.height / 2,
            width: 200,
            height: 50,
            originalWidth: 200,
            originalHeight: 50,
            rotation: 0,
            scale: 1,
            zIndex: 100,
            fontSize: fontSize,
            fontFamily: 'Inter, sans-serif',
            fill: '#ffffff',
            src: '',
        });
    };

    return (
        <div className="p-4 space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Add Text</h3>

            <div className="space-y-3">
                <button
                    onClick={() => addText('Heading', 60)}
                    className="w-full p-4 bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-700 rounded-xl transition text-left group"
                >
                    <span className="text-3xl font-bold text-white group-hover:text-indigo-400">Heading</span>
                </button>

                <button
                    onClick={() => addText('Subheading', 40)}
                    className="w-full p-3 bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-700 rounded-xl transition text-left group"
                >
                    <span className="text-xl font-semibold text-slate-200 group-hover:text-indigo-400">Subheading</span>
                </button>

                <button
                    onClick={() => addText('Body text goes here', 24)}
                    className="w-full p-3 bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-700 rounded-xl transition text-left group"
                >
                    <span className="text-base text-slate-400 group-hover:text-indigo-400">Body text</span>
                </button>
            </div>
        </div>
    );
};
