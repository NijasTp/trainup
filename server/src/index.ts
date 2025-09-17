// index.ts
import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { connectDB } from "./config/db";
import { logger } from "./utils/logger.util";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(` Server running on http://localhost:${PORT}`);
  });
});
