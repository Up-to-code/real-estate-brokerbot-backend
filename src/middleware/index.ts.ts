import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '../config/config';
import { requestLogger } from './Logger';
 
export const setupMiddleware = (app: Application): void => {
  // Security headers
  app.use(helmet());
  
  // CORS
  app.use(cors(config.cors));
  
  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Request logging
  app.use(requestLogger);
};