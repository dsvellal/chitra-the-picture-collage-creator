import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ShortcutsDialog: React.FC<ShortcutsDialogProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const shortcuts = [
        { key: ['⌫', 'Del'], description: 'Delete selected item' },
        { key: ['⌘', 'Z'], description: 'Undo last action' },
        { key: ['⌘', '⇧', 'Z'], description: 'Redo last action' },
        { key: ['Double Click'], description: 'Edit text / Crop image' },
        { key: ['Drag'], description: 'Move items' },
        { key: ['Scroll'], description: 'Zoom canvas (when hovering)' },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Keyboard className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {shortcuts.map((shortcut, index) => (
                            <div key={index} className="flex items-center justify-between group">
                                <span className="text-slate-300 font-medium group-hover:text-indigo-300 transition-colors">
                                    {shortcut.description}
                                </span>
                                <div className="flex gap-1.5">
                                    {shortcut.key.map((k, i) => (
                                        <kbd
                                            key={i}
                                            className="px-2.5 py-1.5 min-w-[32px] text-center text-xs font-bold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg shadow-sm"
                                        >
                                            {k === '⌘' ? <Command size={12} /> : k}
                                        </kbd>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-slate-800/50 text-center text-xs text-slate-500 border-t border-slate-800">
                        Press <kbd className="font-bold text-slate-400">Esc</kbd> to close
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
