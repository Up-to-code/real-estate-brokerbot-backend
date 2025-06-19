import express from "express";
import { config } from "./config/config";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { setupMiddleware } from "./middleware/index.ts";
import router from "./routes/index.ts";

const app = express();

// Setup middleware
setupMiddleware(app);

// Setup routes
app.use("/api/v1", router);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server is running on http://localhost:${config.port}`);
  console.log(`🟢 Health check: http://localhost:${config.port}/api/v1`);
  console.log(`🔧 Environment: ${config.nodeEnv}`);
  console.log(process.env.VERIFY_TOKEN || "no token Emji 🤔");
});
