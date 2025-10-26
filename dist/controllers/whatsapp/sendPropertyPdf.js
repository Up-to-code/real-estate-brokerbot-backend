"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPropertyPdf = void 0;
const generatePRopertyPdf_1 = __importDefault(require("../../services/boot/pdf/generatePRopertyPdf"));
const sendPropertyPdf = async (req, res) => {
    try {
        const { propertyId, phone, marketerName } = req.body;
        if (!propertyId || !phone || !marketerName) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: propertyId, phone, marketerName"
            });
        }
        const result = await (0, generatePRopertyPdf_1.default)({
            type: "event",
            name: marketerName,
            details: { propertyId, phone }
        });
        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message
            });
        }
        else {
            return res.status(500).json({
                success: false,
                message: result.message
            });
        }
    }
    catch (error) {
        console.error("Error in sendPropertyPdf:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
exports.sendPropertyPdf = sendPropertyPdf;
