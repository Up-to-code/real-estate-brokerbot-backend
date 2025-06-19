// Error handler utility
import { Response } from "express";

const handleError = (res: Response, error: any, message: string) => {
  console.error(message, error);
  res.status(500).json({ error: message });
};

export default handleError;
