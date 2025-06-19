import { prisma } from "../../lib/prisma";
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, Client, Prisma, Message } from '@prisma/client';

const router = express.Router();
 
// Async wrapper for route handlers
const asyncHandler = <T extends Request, U extends Response>(fn: (req: T, res: U, next: NextFunction) => Promise<any>) => (req: T, res: U, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==============================================================================
// CLIENTS ROUTES
// ==============================================================================

// GET /clients - Get all clients with optional filtering
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    type,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query as Record<string, any>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build where clause
  const where: Prisma.ClientWhereInput = {};
  
  if (search) {
    (where as any).OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phoneNumber: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (type) {
    (where as any).type = type;
  }

  // Build orderBy clause
  const orderBy: Record<string, any> = {};
  orderBy[sortBy] = sortOrder;

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      }
    }),
    prisma.client.count({ where })
  ]);

  res.json({
    clients,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

// GET /clients/:id - Get single client by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { includeMessages = false } = req.query as Record<string, any>;

  const include: any = {
    _count: {
      select: { messages: true }
    }
  };

  if (includeMessages === 'true') {
    include.messages = {
      orderBy: { createdAt: 'desc' },
      take: 50
    };
  }

  const client = await prisma.client.findUnique({
    where: { id },
    include
  });

  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  res.json(client);
}));

// POST /clients - Create new client
router.post('/', async (req, res) => {
  console.log("req.body", req.body);
  const { 
    name, 
    phone,
     type = 'Client',
    lastMessage = ''
  } = req.body;

  // Validation
  if (!name || !phone) {
    return res.status(400).json({ 
      error: 'Name and phone number are required' 
    });
  }

  // Check if phone number already exists
  const existingClient = await prisma.client.findUnique({
    where: { phoneNumber : phone }
  });

  if (existingClient) {
    return res.status(409).json({ 
      error: 'Client with this phone number already exists' 
    });
  }

  const client = await prisma.client.create({
    data: {
      name,
      phoneNumber : phone,
       type,
      lastMessage
    }
  });

  res.status(201).json(client);
})

// PUT /clients/:id - Update client
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    name, 
    phoneNumber, 
    email, 
    type,
    lastMessage
  } = req.body;

  // Check if client exists
  const existingClient = await prisma.client.findUnique({
    where: { id }
  });

  if (!existingClient) {
    return res.status(404).json({ error: 'Client not found' });
  }

  // If updating phone number, check for duplicates
  if (phoneNumber && phoneNumber !== existingClient.phoneNumber) {
    const duplicateClient = await prisma.client.findUnique({
      where: { phoneNumber }
    });

    if (duplicateClient) {
      return res.status(409).json({ 
        error: 'Client with this phone number already exists' 
      });
    }
  }

  const updatedClient = await prisma.client.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(phoneNumber && { phoneNumber }),
      ...(email !== undefined && { email }),
      ...(type && { type }),
      ...(lastMessage !== undefined && { lastMessage }),
      lastActive: new Date()
    }
  });

  res.json(updatedClient);
}));

// PATCH /clients/:id - Partial update client
router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  // Check if client exists
  const existingClient = await prisma.client.findUnique({
    where: { id }
  });

  if (!existingClient) {
    return res.status(404).json({ error: 'Client not found' });
  }

  // If updating phone number, check for duplicates
  if (updates.phoneNumber && updates.phoneNumber !== existingClient.phoneNumber) {
    const duplicateClient = await prisma.client.findUnique({
      where: { phoneNumber: updates.phoneNumber }
    });

    if (duplicateClient) {
      return res.status(409).json({ 
        error: 'Client with this phone number already exists' 
      });
    }
  }

  const updatedClient = await prisma.client.update({
    where: { id },
    data: {
      ...updates,
      lastActive: new Date()
    }
  });

  res.json(updatedClient);
}));

// DELETE /clients/:id - Delete client
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if client exists
  const existingClient = await prisma.client.findUnique({
    where: { id }
  });

  if (!existingClient) {
    return res.status(404).json({ error: 'Client not found' });
  }

  // Delete related messages first (if cascade delete is not set up)
  await prisma.message.deleteMany({
    where: { clientId: id }
  });

  // Delete client
  await prisma.client.delete({
    where: { id }
  });

  res.status(204).send();
}));

// POST /clients/bulk - Create multiple clients
router.post('/bulk', asyncHandler(async (req: Request, res: Response) => {
  const { clients } = req.body;

  if (!Array.isArray(clients) || clients.length === 0) {
    return res.status(400).json({ 
      error: 'Clients array is required and cannot be empty' 
    });
  }

  const results: { success: number; failed: number; errors: string[] } = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (const clientData of clients) {
    try {
      // Validate required fields
      if (!clientData.name || !clientData.phoneNumber) {
        results.failed++;
        results.errors.push(`Client missing required fields: ${JSON.stringify(clientData)}`);
        continue;
      }

      // Check for duplicate phone number
      const existingClient = await prisma.client.findUnique({
        where: { phoneNumber: clientData.phoneNumber }
      });

      if (existingClient) {
        results.failed++;
        results.errors.push(`Duplicate phone number: ${clientData.phoneNumber}`);
        continue;
      }

      await prisma.client.create({
        data: {
          name: clientData.name,
          phoneNumber: clientData.phoneNumber,
          email: clientData.email,
          type: clientData.type || 'Client',
          lastMessage: clientData.lastMessage || ''
        }
      });

      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(`Error creating client ${clientData.name}: ${error.message}`);
    }
  }

  res.json(results);
}));

// GET /clients/:id/messages - Get all messages for a client
router.get('/:id/messages', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query as Record<string, any>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Check if client exists
  const client = await prisma.client.findUnique({
    where: { id }
  });

  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { clientId: id },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.message.count({ where: { clientId: id } })
  ]);

  res.json({
    messages,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

// POST /clients/:id/messages - Send message to client
router.post('/:id/messages', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, isBot = false, whatsappMessageId, status = 'SENT' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  // Check if client exists
  const client = await prisma.client.findUnique({
    where: { id }
  });

  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  const message = await prisma.message.create({
    data: {
      text,
      clientId: id,
      isBot,
      whatsappMessageId,
      status,
      sentAt: new Date()
    }
  });

  // Update client's last message and last active
  await prisma.client.update({
    where: { id },
    data: {
      lastMessage: text,
      lastActive: new Date()
    }
  });

  res.status(201).json(message);
}));

// GET /clients/search - Search clients
router.get('/search/:query', asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.params;
  const { limit = 10 } = req.query as Record<string, any>;

  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { phoneNumber: { contains: query } },
        { email: { contains: query, mode: 'insensitive' } }
      ]
    },
    take: parseInt(limit),
    orderBy: { lastActive: 'desc' }
  });

  res.json(clients);
}));

// GET /clients/stats - Get client statistics
router.get('/stats/overview', asyncHandler(async (req: Request, res: Response) => {
  const [total, active, inactive, newThisMonth] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({
      where: {
        lastActive: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    prisma.client.count({
      where: {
        lastActive: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // More than 30 days ago
        }
      }
    }),
    prisma.client.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
  ]);

  res.json({
    total,
    active,
    inactive,
    newThisMonth
  });
}));

// Error handling middleware for this router
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Clients API Error:', err);
  
  if (err.code === 'P2002') {
    return res.status(409).json({ 
      error: 'Duplicate entry',
      field: err.meta?.target?.[0] || 'unknown'
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

export default router;