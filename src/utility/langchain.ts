export const chunkTextWithOverlap = (text: string, chunkSize: number, overlapSize: number) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += (chunkSize - overlapSize)) {
        const chunk = text.slice(i, i + chunkSize);
        chunks.push(chunk);
        if (i + chunkSize >= text.length) {
            break;
        }
    }
    return chunks;
};

export const calculateVectorSize = (vector: any) => {
    const idSize = Buffer.byteLength(vector.id, 'utf8');
    const metadataSize = Buffer.byteLength(JSON.stringify(vector.metadata), 'utf8');
    const valuesSize = vector.values.length * 4;
    return idSize + metadataSize + valuesSize;
};