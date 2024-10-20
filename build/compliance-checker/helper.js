"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkText = exports.extractText = exports.delay = void 0;
const extractText = (node) => {
    let text = "";
    if (typeof node === "string") {
        return node;
    }
    if (Array.isArray(node)) {
        for (const child of node) {
            text += extractText(child) + " ";
        }
    }
    else if (typeof node === "object" && node !== null) {
        if (node.children) {
            text += extractText(node.children);
        }
    }
    return text.trim();
};
exports.extractText = extractText;
const chunkText = (text, maxTokens, isChunkRequired = false) => {
    if (!isChunkRequired) {
        return [text];
    }
    const words = text.split(' ');
    let chunks = [];
    let currentChunk = [];
    words.forEach((word) => {
        const chunkLength = currentChunk.join(' ').split(' ').length;
        if (chunkLength + word.length <= maxTokens) {
            currentChunk.push(word);
        }
        else {
            chunks.push(currentChunk.join(' '));
            currentChunk = [word];
        }
    });
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }
    return chunks;
};
exports.chunkText = chunkText;
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.delay = delay;
