import { Request, Response } from "express";
import generatePropertyPdf from "../../services/boot/pdf/generatePRopertyPdf";

// POST /api/v1/whatsapp/send-property-pdf
export const sendPropertyPdf = async (req: Request, res: Response) => {
  try {
    const { propertyId, phone, marketerName } = req.body;
    if (!propertyId || !phone || !marketerName) {
      return res.status(400).json({ success: false, message: "Missing required fields: propertyId, phone, marketerName" });
    }
    const result = await generatePropertyPdf({
      type: "event",
      name: marketerName,
      details: { propertyId, phone }
    });
    if (result.success) {
      return res.status(200).json({ success: true, message: result.message, messageId: result.messageId, mediaId: result.mediaId });
    } else {
      return res.status(500).json({ success: false, message: result.message, error: result.error });
    }
  } catch (error) {
    console.error("Error in sendPropertyPdf:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error });
  }
}; 