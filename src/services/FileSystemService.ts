
export interface SaveOptions {
    suggestedName?: string;
    types?: Array<{
        description: string;
        accept: Record<string, string[]>;
    }>;
}

export interface IFileSystemService {
    saveFile(blob: Blob, filename: string, options?: SaveOptions): Promise<void>;
}

export class BrowserFileSystemService implements IFileSystemService {
    async saveFile(blob: Blob, filename: string, options?: SaveOptions): Promise<void> {
        // @ts-expect-error - showSaveFilePicker is experimental
        if (typeof window.showSaveFilePicker === 'function') {
            return this._saveUsingFilePicker(blob, filename, options);
        }

        this._saveUsingDownloadLink(blob, filename);
    }

    private async _saveUsingFilePicker(blob: Blob, filename: string, options?: SaveOptions): Promise<void> {
        try {
            // @ts-expect-error - showSaveFilePicker is experimental
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: options?.types,
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
                return; // User cancelled
            }
            throw err;
        }
    }

    private _saveUsingDownloadLink(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

export const fileSystemService = new BrowserFileSystemService();
