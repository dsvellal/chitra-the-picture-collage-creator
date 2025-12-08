import { useRef, useState } from 'react';
import { Layout } from './components/Layout';
import { LeftPanel } from './components/LeftPanel';
import { CollageCanvas } from './components/CollageCanvas';
import { RightPanel } from './components/RightPanel';
import { useCollageStore } from './store/collageStore';
import { CropModal } from './components/CropModal';
import Konva from 'konva';

function App() {
  const stageRef = useRef<Konva.Stage>(null);
  const [croppingItemId, setCroppingItemId] = useState<string | null>(null);
  const collageItems = useCollageStore((state) => state.collageItems);
  const updateCollageItem = useCollageStore((state) => state.updateCollageItem);

  const handleCropApply = (crop: { x: number, y: number, width: number, height: number }) => {
    if (croppingItemId) {
      updateCollageItem(croppingItemId, { crop });
      setCroppingItemId(null);
    }
  };

  const handleExport = async () => {
    // Deselect to hide transformers
    useCollageStore.getState().setSelectedItemId(null);

    // Allow React/Konva frame to clear selection
    setTimeout(async () => {
      if (!stageRef.current) return;
      const stage = stageRef.current;

      const dataURL = stage.toDataURL({ pixelRatio: 2 });

      // Generate Filename: Chitra_Premium_YYYY-MM-DD_HH-mm-ss.png
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `Chitra_Premium_${dateStr}_${timeStr}.png`;

      try {
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
        } else {
          // Fallback
          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.error('Export failed:', err);
      }
    }, 100);
  };

  return (
    <Layout onExport={handleExport}>
      <LeftPanel />
      <CollageCanvas stageRef={stageRef} onEditRequest={(id) => setCroppingItemId(id)} />
      <RightPanel />

      {croppingItemId && (
        <CropModal
          item={collageItems.find(i => i.id === croppingItemId)!}
          onApply={handleCropApply}
          onCancel={() => setCroppingItemId(null)}
        />
      )}
    </Layout>
  );
}

export default App;
