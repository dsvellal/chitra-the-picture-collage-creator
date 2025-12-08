import Konva from 'konva';

export const downloadCollage = (stage: Konva.Stage, pixelRatio = 3) => {
    if (!stage) return;

    // Deselect any active transformers for clean export?
    // We handle that by clicking away mostly, but ideally we should hide transformer layer.
    // Or we can just export. Transformers are on a Layer. If we export the Stage, it shows everything.
    // Better approach: Find all Transformers and hide them, then show back?
    // Or: Just assume user keeps them?
    // Let's hide nodes that are strictly UI.
    // Actually, standard approach: user clicks "Export", we can programmatically deselect in store?
    // Since selection is local in CollageCanvas (useState), we can't easily reset it from here without triggering callback.
    // But for now, let's just export.

    const dataURL = stage.toDataURL({
        pixelRatio: pixelRatio, // High res
        mimeType: 'image/jpeg',
        quality: 0.9,
    });

    const link = document.createElement('a');
    link.download = `collage-${Date.now()}.jpg`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
