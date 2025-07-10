"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendImage = sendImage;
exports.sendImageWithText = sendImageWithText;
exports.sendDocument = sendDocument;
exports.sendVideo = sendVideo;
exports.sendAudio = sendAudio;
exports.sendFile = sendFile;
exports.sendPDF = sendPDF;
exports.sendMultipleFiles = sendMultipleFiles;
const httpClient_1 = require("./httpClient");
const textMessaging_1 = require("./textMessaging");
const utils_1 = require("./utils");
async function sendImage(config, to, imageUrl, caption, options = {}) {
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'image',
        image: {
            url: imageUrl,
            ...(caption && { caption })
        }
    };
    if (options.replyToMessageId) {
        payload.context = { message_id: options.replyToMessageId };
    }
    return (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
}
async function sendImageWithText(config, to, imageUrl, text, options = {}) {
    const imageResponse = await sendImage(config, to, imageUrl, undefined, options);
    await new Promise(resolve => setTimeout(resolve, 500));
    const textResponses = await (0, textMessaging_1.sendTextWithTypingEffect)(config, to, text, {
        typingSpeed: options.typingSpeed
    });
    return {
        image: imageResponse,
        text: textResponses
    };
}
async function sendDocument(config, to, documentUrl, filename, caption, options = {}) {
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'document',
        document: {
            url: documentUrl,
            ...(filename && { filename }),
            ...(caption && { caption })
        }
    };
    if (options.replyToMessageId) {
        payload.context = { message_id: options.replyToMessageId };
    }
    return (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
}
async function sendVideo(config, to, videoUrl, caption, options = {}) {
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'video',
        video: {
            url: videoUrl,
            ...(caption && { caption })
        }
    };
    if (options.replyToMessageId) {
        payload.context = { message_id: options.replyToMessageId };
    }
    return (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
}
async function sendAudio(config, to, audioUrl, options = {}) {
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'audio',
        audio: {
            url: audioUrl
        }
    };
    if (options.replyToMessageId) {
        payload.context = { message_id: options.replyToMessageId };
    }
    return (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
}
async function sendFile(config, to, fileUrl, filename, caption, options = {}) {
    const detectedFilename = filename || (0, utils_1.extractFilenameFromUrl)(fileUrl);
    const fileExtension = (0, utils_1.getFileExtension)(detectedFilename);
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'document',
        document: {
            url: fileUrl,
            filename: detectedFilename,
            ...(caption && { caption })
        }
    };
    if (options.replyToMessageId) {
        payload.context = { message_id: options.replyToMessageId };
    }
    return (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
}
async function sendPDF(config, to, pdfUrl, filename, caption, options = {}) {
    const pdfFilename = filename || (0, utils_1.extractFilenameFromUrl)(pdfUrl) || 'document.pdf';
    return sendFile(config, to, pdfUrl, pdfFilename, caption, options);
}
async function sendMultipleFiles(config, to, files, options = {}) {
    const responses = [];
    const delay = options.delayBetweenFiles || 1000;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        const response = await sendFile(config, to, file.url, file.filename, file.caption, {
            replyToMessageId: i === 0 ? options.replyToMessageId : undefined
        });
        responses.push(response);
    }
    return responses;
}
