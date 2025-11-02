import express from "express";
import cors from "cors";
import { config } from "./config/config";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { setupMiddleware } from "./middleware/index.ts";
import router from "./routes";

const app = express();

// Use CORS at the very top
app.use(cors(config.cors));

// Setup middleware

setupMiddleware(app);

// Setup routes
app.use("/api/v1", router);

// Simple health check for Vercel
app.get("/", (req, res) => {
  res.json({ 
    message: "Real Estate Broker Bot API", 
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server only if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`🚀 Server is running on http://localhost:${config.port}`);
    console.log(`🟢 Health check: http://localhost:${config.port}/api/v1`);
    console.log(`🔧 Environment: ${config.nodeEnv}`);
    console.log(process.env.VERIFY_TOKEN || "no token Emji 🤔");
  });
}


// Export for Vercel
export default app;
