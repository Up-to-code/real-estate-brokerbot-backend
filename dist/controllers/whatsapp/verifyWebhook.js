"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhook = void 0;
const createWebhookVerificationError_1 = require("../../errors/createWebhookVerificationError");
const verifyWebhook = (req, res, next) => {
    try {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];
        const verifyToken = process.env.VERIFY_TOKEN;
        console.log("Webhook verification attempt:", {
            mode,
            token: token ? "provided" : "missing",
            verifyToken: verifyToken ? "configured" : "missing",
        });
        if (!verifyToken) {
            console.error("VERIFY_TOKEN environment variable is not set");
            throw (0, createWebhookVerificationError_1.createWebhookVerificationError)("Server configuration error.");
        }
        if (!mode || !token || !challenge) {
            console.error("Missing required webhook parameters:", {
                mode,
                token: !!token,
                challenge: !!challenge,
            });
            throw (0, createWebhookVerificationError_1.createWebhookVerificationError)("Required webhook parameters are missing.");
        }
        if (mode === "subscribe" && token === verifyToken) {
            console.log("Webhook verified successfully");
            return res.status(200).send(challenge);
        }
        else {
            console.error("Webhook verification failed:", {
                modeMatch: mode === "subscribe",
                tokenMatch: token === verifyToken,
            });
            throw (0, createWebhookVerificationError_1.createWebhookVerificationError)("Webhook verification failed.");
        }
    }
    catch (error) {
        console.error("Webhook verification error:", error);
        return next(error);
    }
};
exports.verifyWebhook = verifyWebhook;
