import { Request, Response, NextFunction } from "express";
import { WebhookQuery } from "./type";
import { createWebhookVerificationError } from "../../errors/createWebhookVerificationError";

/**
 * WhatsApp webhook verification function
 * Handles GET requests for webhook verification
 */
export const verifyWebhook = (
  req: Request<{}, {}, {}, WebhookQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const mode = req.query["hub.mode"] as string;
    const token = req.query["hub.verify_token"] as string;
    const challenge = req.query["hub.challenge"] as string;
    const verifyToken = process.env.VERIFY_TOKEN;

    console.log("Webhook verification attempt:", {
      mode,
      token: token ? "provided" : "missing",
      verifyToken: verifyToken ? "configured" : "missing",
    });

    // Check if required environment variable is set
    if (!verifyToken) {
      console.error("VERIFY_TOKEN environment variable is not set");
      throw createWebhookVerificationError("Server configuration error.");
    }

    // Check if all required parameters are present
    if (!mode || !token || !challenge) {
      console.error("Missing required webhook parameters:", {
        mode,
        token: !!token,
        challenge: !!challenge,
      });
      throw createWebhookVerificationError(
        "Required webhook parameters are missing."
      );
    }

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Webhook verified successfully");
      return res.status(200).send(challenge);
    } else {
      console.error("Webhook verification failed:", {
        modeMatch: mode === "subscribe",
        tokenMatch: token === verifyToken,
      });
      throw createWebhookVerificationError("Webhook verification failed.");
    }
  } catch (error) {
    console.error("Webhook verification error:", error);
    return next(error);
  }
};
