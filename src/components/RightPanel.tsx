import React from 'react';
import { useCollageStore } from '../store/collageStore';
import { Type, Image as ImageIcon } from 'lucide-react';
import { CommonActions } from './panels/CommonActions';
import { CanvasProperties } from './panels/CanvasProperties';
import { TextProperties } from './panels/TextProperties';
import { ImageProperties } from './panels/ImageProperties';


const RightPanelHeader = ({ type, onClose }: { type: string; onClose: () => void }) => (
    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-indigo-600/10">
        <h2 className="font-semibold text-white flex items-center gap-2">
            {type === 'text' ? <Type size={16} className="text-indigo-400" /> : <ImageIcon size={16} className="text-indigo-400" />}
            {type === 'text' ? 'Text Properties' : 'Image Properties'}
        </h2>
        <button onClick={onClose} className="text-xs text-slate-400 hover:text-white">Close</button>
    </div>
);

import type { CollageItem } from '../store/collageStore';

const RightPanelContent = ({ item, onUpdate, onRemove }: { item: CollageItem, onUpdate: (id: string, updates: Partial<CollageItem>) => void, onRemove: (id: string) => void }) => (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
        <CommonActions item={item} onUpdate={onUpdate} onRemove={onRemove} />
        {item.type === 'text' && <TextProperties item={item} onUpdate={onUpdate} />}
        {item.type === 'image' && <ImageProperties item={item} onUpdate={onUpdate} />}
    </div>
);

export const RightPanel: React.FC = () => {
    const { canvasSettings, setCanvasSettings, selectedItemId, collageItems, updateCollageItem, removeCollageItem, setSelectedItemId } = useCollageStore();
    const selectedItem = selectedItemId ? collageItems.find(i => i.id === selectedItemId) : null;

    if (!selectedItem) return <CanvasProperties settings={canvasSettings} onUpdate={setCanvasSettings} />;

    return (
        <div className="w-72 h-full bg-slate-900/50 border-l border-white/10 flex flex-col backdrop-blur-xl">
            <RightPanelHeader type={selectedItem.type} onClose={() => setSelectedItemId(null)} />
            <RightPanelContent item={selectedItem} onUpdate={updateCollageItem} onRemove={removeCollageItem} />
        </div>
    );
};
