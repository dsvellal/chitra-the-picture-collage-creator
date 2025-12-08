import { useRef, useState } from 'react';
import { Layout } from './components/Layout';
import { LeftPanel } from './components/LeftPanel';
import { CollageCanvas } from './components/CollageCanvas';
import { RightPanel } from './components/RightPanel';
import { useCollageStore } from './store/collageStore';
import { CropModal } from './components/CropModal';
import { useExport } from './hooks/useExport';
import Konva from 'konva';

function App() {
  const stageRef = useRef<Konva.Stage>(null);
  const [croppingItemId, setCroppingItemId] = useState<string | null>(null);
  const collageItems = useCollageStore((state) => state.collageItems);
  const updateCollageItem = useCollageStore((state) => state.updateCollageItem);

  const { exportCollage } = useExport(stageRef);

  const handleApplyCrop = (crop: { x: number, y: number, width: number, height: number }) => {
    if (croppingItemId) {
      updateCollageItem(croppingItemId, { crop });
      setCroppingItemId(null);
    }
  };

  return (
    <Layout onExport={exportCollage}>
      <LeftPanel />
      <CollageCanvas stageRef={stageRef} onEditRequest={(id) => setCroppingItemId(id)} />
      <RightPanel />

      {croppingItemId && (
        <CropModal
          item={collageItems.find(i => i.id === croppingItemId)!}
          onApply={handleApplyCrop}
          onCancel={() => setCroppingItemId(null)}
        />
      )}
    </Layout>
  );
}

export default App;
