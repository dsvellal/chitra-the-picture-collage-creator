import { useCallback } from 'react';
import Konva from 'konva';
import { useCollageStore } from '../store/collageStore';
import { useToast } from '../contexts/ToastContext';

export const useExport = (stageRef: React.RefObject<Konva.Stage | null>) => {
    const { setSelectedItemId } = useCollageStore();
    const { addToast } = useToast();

    const exportCollage = useCallback(async () => {
        // Deselect to hide transformers
        setSelectedItemId(null);

        // Allow React/Konva frame to clear selection
        setTimeout(async () => {
            try {
                if (!stageRef.current) return;
                const stage = stageRef.current;
                const dataURL = stage.toDataURL({ pixelRatio: 2 });

                // Generate Filename: Chitra_Premium_YYYY-MM-DD_HH-mm-ss.png
                const now = new Date();
                const dateStr = now.toISOString().split('T')[0];
                const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
                const fileName = `Chitra_Premium_${dateStr}_${timeStr}.png`;
                // @ts-expect-error - experimental API
                if (window.showSaveFilePicker) {
                    // @ts-expect-error - showSaveFilePicker is an experimental API not yet in TS lib
                    const handle = await window.showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{
                            description: 'PNG Image',
                            accept: { 'image/png': ['.png'] },
                        }],
                    });
                    const writable = await handle.createWritable();
                    const blob = await (await fetch(dataURL)).blob();
                    await writable.write(blob);
                    await writable.close();
                    addToast('Collage exported successfully!', 'success');
                } else {
                    // Fallback
                    const link = document.createElement('a');
                    link.setAttribute('download', fileName);
                    link.setAttribute('href', dataURL);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    addToast('Export downloaded', 'success');
                }
            } catch (err) {
                console.error('Export failed:', err);
                addToast('Failed to export collage', 'error');
            }
        }, 100);
    }, [stageRef, setSelectedItemId, addToast]);

    return { exportCollage };
};
