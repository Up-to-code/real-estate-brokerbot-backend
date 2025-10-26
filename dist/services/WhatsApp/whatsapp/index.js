"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = exports.sendImagesGroup = void 0;
__exportStar(require("./types"), exports);
__exportStar(require("./error"), exports);
__exportStar(require("./httpClient"), exports);
__exportStar(require("./textMessaging"), exports);
__exportStar(require("./mediaMessaging"), exports);
var mediaMessaging_1 = require("./mediaMessaging");
Object.defineProperty(exports, "sendImagesGroup", { enumerable: true, get: function () { return mediaMessaging_1.sendImagesGroup; } });
__exportStar(require("./interactiveMessaging"), exports);
__exportStar(require("./reactionsStatus"), exports);
__exportStar(require("./locationContact"), exports);
__exportStar(require("./utils"), exports);
exports.DEFAULT_CONFIG = {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
};
