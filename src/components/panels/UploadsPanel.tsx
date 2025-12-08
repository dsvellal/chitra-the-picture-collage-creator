import { useState } from 'react';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { useCollageStore } from '../../store/collageStore';
import clsx from 'clsx';
import { useSelection } from '../../hooks/useSelection';

export const UploadsPanel = () => {
    const { addUploadedImage, removeUploadedImage, uploadedImages } = useCollageStore();
    const [isDragging, setIsDragging] = useState(false);
    const { selectedIds, toggleSelection } = useSelection(uploadedImages);

    const processFiles = (files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => e.target?.result && addUploadedImage(e.target.result as string);
                reader.readAsDataURL(file);
            }
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10">
                <h2 className="font-semibold text-white">Your Uploads</h2>
            </div>

            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                {uploadedImages.length === 0 ? (
                    <div
                        className={clsx(
                            "h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-colors cursor-pointer",
                            isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-slate-700 hover:border-slate-500 text-slate-500"
                        )}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); }}
                        onClick={() => document.getElementById('hidden-file-input')?.click()}
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                            <Upload size={20} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-400">Click or Drag images</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <div
                            className="aspect-square border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800 transition-colors"
                            onClick={() => document.getElementById('hidden-file-input')?.click()}
                        >
                            <Plus size={24} className="text-slate-500" />
                        </div>
                        {uploadedImages.map((src, idx) => {
                            const isSelected = selectedIds.has(src);
                            return (
                                <div
                                    key={idx}
                                    className={clsx(
                                        "relative group aspect-square rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border",
                                        isSelected ? "ring-2 ring-indigo-500 border-indigo-500" : "border-white/5 bg-slate-800"
                                    )}
                                    onClick={(e) => {
                                        if (e.metaKey || e.ctrlKey || e.shiftKey) toggleSelection(src, idx, e);
                                    }}
                                >
                                    <div
                                        className={clsx(
                                            "absolute top-2 right-2 w-5 h-5 rounded-full border border-white flex items-center justify-center z-10 cursor-pointer shadow-sm",
                                            isSelected ? "bg-indigo-600 border-transparent" : "bg-black/40 hover:bg-black/60"
                                        )}
                                        onClick={(e) => { e.stopPropagation(); toggleSelection(src, idx, e); }}
                                    >
                                        {isSelected && <div className="w-1 h-2 border-r-[1.5px] border-b-[1.5px] border-white rotate-45 mb-0.5" />}
                                    </div>
                                    <div
                                        className="absolute top-2 left-2 p-1 rounded-md bg-red-500/90 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) removeUploadedImage(src); }}
                                    >
                                        <Trash2 size={12} />
                                    </div>
                                    <img
                                        src={src}
                                        className="w-full h-full object-cover"
                                        draggable
                                        onDragStart={(e) => {
                                            const codeSrcs = (isSelected && selectedIds.size > 0) ? Array.from(selectedIds) : [src];
                                            e.dataTransfer.setData('imageSrcs', JSON.stringify(codeSrcs));
                                        }}
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <input type="file" id="hidden-file-input" multiple accept="image/*" className="hidden" onChange={(e) => processFiles(e.target.files)} />
        </div>
    );
};
