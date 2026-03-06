import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export const sharePDF = async (base64Data, filename = 'rapor.pdf') => {
    try {
        // base64Data comes as "data:application/pdf;filename=generated.pdf;base64,JVBERi..."
        // We need to strip the prefix to save it via capacitor filesystem
        const base64Content = base64Data.split('base64,')[1];

        if (!base64Content) {
            throw new Error('Invalid Base64 data');
        }

        // 1. Save file to cache directory temporarily
        const writeResult = await Filesystem.writeFile({
            path: filename,
            data: base64Content,
            directory: Directory.Cache,
        });

        // 2. Share the local file via native share sheet
        if (Capacitor.isNativePlatform()) {
            await Share.share({
                title: i18n.t('sharing.reportTitle'),
                text: i18n.t('sharing.reportText'),
                url: writeResult.uri,
                dialogTitle: i18n.t('sharing.dialogTitle'),
            });
            console.log('[fileService] PDF shared successfully natively');
        } else {
            // Fallback for Web/Browser Testing
            const link = document.createElement('a');
            link.href = base64Data;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('[fileService] PDF downloaded via browser fallback');
        }
    } catch (error) {
        console.error('[fileService] Error sharing PDF:', error);
        throw error;
    }
};
