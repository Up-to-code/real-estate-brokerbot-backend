export const config = {
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Database (example for future use)
  database: {
    url: process.env.DATABASE_URL || 'sqlite://./db.sqlite',
  },
  
  // JWT (example for future use)
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // CORS
  cors: {
    origin: '*',
    credentials: true,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
} as const;

console.log('CORS allowed origins:', process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']);