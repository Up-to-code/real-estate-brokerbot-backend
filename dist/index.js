"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config/config");
const errorHandler_1 = require("./middleware/errorHandler");
const index_ts_1 = require("./middleware/index.ts");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)(config_1.config.cors));
(0, index_ts_1.setupMiddleware)(app);
app.use("/api/v1", routes_1.default);
app.get("/", (req, res) => {
    res.json({
        message: "Real Estate Broker Bot API",
        status: "running",
        timestamp: new Date().toISOString()
    });
});
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(config_1.config.port, () => {
        console.log(`🚀 Server is running on http://localhost:${config_1.config.port}`);
        console.log(`🟢 Health check: http://localhost:${config_1.config.port}/api/v1`);
        console.log(`🔧 Environment: ${config_1.config.nodeEnv}`);
        console.log(process.env.VERIFY_TOKEN || "no token Emji 🤔");
    });
}
exports.default = app;
