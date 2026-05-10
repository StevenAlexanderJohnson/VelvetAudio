
export function formatFileName(title: string): string {
    return title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp3';
}