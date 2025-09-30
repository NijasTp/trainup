import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db";
import { logger } from "./utils/logger.util";
import { httpServer } from "./app";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    logger.info(` Server running on http://localhost:${PORT}`);
  });
});