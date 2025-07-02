# Real Estate Broker Bot Backend

A Node.js/Express.js API backend for a real estate broker bot application.

## Features

- WhatsApp webhook integration
- Property management
- Client management
- AI-powered Q&A system
- Campaign management
- Template system

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment on Vercel

This project is configured for deployment on Vercel with the following setup:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Runtime**: Node.js

### Environment Variables

Make sure to set the following environment variables in your Vercel project:

- `DATABASE_URL`: Your database connection string
- `VERIFY_TOKEN`: WhatsApp webhook verification token
- `NODE_ENV`: Set to `production` for production deployments

### API Endpoints

- `GET /` - Health check
- `GET /api/v1/` - Dashboard statistics
- `POST /api/v1/webhook/whatsapp` - WhatsApp webhook
- `GET /api/v1/properties` - Get properties
- `GET /api/v1/clients` - Get clients
- `POST /api/v1/qa` - AI Q&A endpoint

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
└── types/           # TypeScript type definitions
``` 