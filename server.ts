import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import winston from "winston";
import crypto from "crypto";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";

dotenv.config();

// Create structured Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

// Validation schema for Telegram notify
const notifySchema = z.object({
  chatId: z.string()
    .max(20, { message: "Invalid payload" })
    .regex(/^\d+$/, { message: "Invalid payload" }),
  message: z.string()
    .transform(val => val.replace(/<[^>]*>/g, ''))
    .refine(val => val.length >= 1 && val.length <= 1000, { message: "Invalid payload" })
});

// Rate limiting middleware for /api/notify: max 5 requests per minute per IP
const notifyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  handler: (req, res) => {
    const requestId = crypto.randomUUID();
    logger.warn({
      timestamp: new Date().toISOString(),
      level: "warn",
      request_id: requestId,
      endpoint: "/api/notify",
      status: 429,
      message: "Rate limit breached (POST /api/notify)"
    });
    res.status(429).json({ error: "Too many requests, try again later" });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Strict HTTP Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Remove headers leaking implementation details
    res.removeHeader("X-Powered-By");
    next();
  });

  // API route for Telegram notifications with validation and rate-limiting
  app.post("/api/notify", notifyLimiter, async (req, res) => {
    const requestId = crypto.randomUUID();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      logger.error({
        timestamp: new Date().toISOString(),
        level: "error",
        request_id: requestId,
        endpoint: "/api/notify",
        status: 500,
        message: "Telegram bot token not configured"
      });
      return res.status(500).json({ error: "Telegram bot token not configured" });
    }

    // Validate request body
    const parseResult = notifySchema.safeParse(req.body);
    if (!parseResult.success) {
      logger.warn({
        timestamp: new Date().toISOString(),
        level: "warn",
        request_id: requestId,
        endpoint: "/api/notify",
        status: 400,
        message: "Request validation failed",
        error: "Invalid payload"
      });
      return res.status(400).json({ error: "Invalid payload" });
    }

    const { chatId, message } = parseResult.data;

    try {
      // Outbound message to telegram with a 5000ms timeout
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: message
      }, {
        timeout: 5000
      });

      logger.info({
        timestamp: new Date().toISOString(),
        level: "info",
        request_id: requestId,
        endpoint: "/api/notify",
        status: 200,
        message: "Telegram message sent successfully"
      });

      res.json({ status: "ok" });
    } catch (error: any) {
      const isTimeout = error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'));
      const status = isTimeout ? 503 : 500;
      const errorMsg = isTimeout ? "Notification service unavailable" : "Failed to send notification";

      logger.error({
        timestamp: new Date().toISOString(),
        level: "error",
        request_id: requestId,
        endpoint: "/api/notify",
        status,
        message: `Failed to send Telegram message: ${error.message || error}`,
        error: error.stack || String(error)
      });

      res.status(status).json({ error: errorMsg });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info({
      timestamp: new Date().toISOString(),
      level: "info",
      request_id: "system-startup",
      endpoint: "system",
      status: 0,
      message: `Server running on http://localhost:${PORT}`
    });
  });
}

startServer();
