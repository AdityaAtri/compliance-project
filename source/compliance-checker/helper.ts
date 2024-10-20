const extractText = (node: any) => {
    let text = "";
    if (typeof node === "string") {
        return node;
    }
    if (Array.isArray(node)) {
        for (const child of node) {
            text += extractText(child) + " ";
        }
    } else if (typeof node === "object" && node !== null) {
        if (node.children) {
            text += extractText(node.children);
        }
    }
    return text.trim();
};

const chunkText = (text: any, maxTokens: number, isChunkRequired: boolean = false) => {
    if(!isChunkRequired) {
        return [text];
    }
    const words = text.split(' ');
    let chunks = [];
    let currentChunk: any = [];

    words.forEach((word: any) => {
        const chunkLength = currentChunk.join(' ').split(' ').length;
        if (chunkLength + word.length <= maxTokens) {
            currentChunk.push(word);
        } else {
            chunks.push(currentChunk.join(' '));
            currentChunk = [word];
        }
    });

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }

    return chunks;
};

const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export {
    delay,
    extractText,
    chunkText,
}