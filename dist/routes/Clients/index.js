"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../lib/prisma");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
router.get('/', asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, type, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } }
        ];
    }
    if (type) {
        where.type = type;
    }
    const orderBy = {};
    orderBy[sortBy] = sortOrder;
    const [clients, total] = await Promise.all([
        prisma_1.prisma.client.findMany({
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
        prisma_1.prisma.client.count({ where })
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
    return;
}));
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { includeMessages = false } = req.query;
    const include = {
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
    const client = await prisma_1.prisma.client.findUnique({
        where: { id },
        include
    });
    if (!client) {
        return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
    return;
}));
router.post('/', async (req, res) => {
    console.log("req.body", req.body);
    const { name, phone, type = 'Client', lastMessage = '' } = req.body;
    if (!name || !phone) {
        return res.status(400).json({
            error: 'Name and phone number are required'
        });
    }
    const existingClient = await prisma_1.prisma.client.findUnique({
        where: { phoneNumber: phone }
    });
    if (existingClient) {
        return res.status(409).json({
            error: 'Client with this phone number already exists'
        });
    }
    const client = await prisma_1.prisma.client.create({
        data: {
            name,
            phoneNumber: phone,
            type,
            lastMessage
        }
    });
    res.status(201).json(client);
    return;
});
router.put('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, phoneNumber, email, type, lastMessage } = req.body;
    const existingClient = await prisma_1.prisma.client.findUnique({
        where: { id }
    });
    if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
    }
    if (phoneNumber && phoneNumber !== existingClient.phoneNumber) {
        const duplicateClient = await prisma_1.prisma.client.findUnique({
            where: { phoneNumber }
        });
        if (duplicateClient) {
            return res.status(409).json({
                error: 'Client with this phone number already exists'
            });
        }
    }
    const updatedClient = await prisma_1.prisma.client.update({
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
    return;
}));
router.patch('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const existingClient = await prisma_1.prisma.client.findUnique({
        where: { id }
    });
    if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
    }
    if (updates.phoneNumber && updates.phoneNumber !== existingClient.phoneNumber) {
        const duplicateClient = await prisma_1.prisma.client.findUnique({
            where: { phoneNumber: updates.phoneNumber }
        });
        if (duplicateClient) {
            return res.status(409).json({
                error: 'Client with this phone number already exists'
            });
        }
    }
    const updatedClient = await prisma_1.prisma.client.update({
        where: { id },
        data: {
            ...updates,
            lastActive: new Date()
        }
    });
    res.json(updatedClient);
    return;
}));
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existingClient = await prisma_1.prisma.client.findUnique({
        where: { id }
    });
    if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
    }
    await prisma_1.prisma.message.deleteMany({
        where: { clientId: id }
    });
    await prisma_1.prisma.client.delete({
        where: { id }
    });
    res.status(204).send();
    return;
}));
router.post('/bulk', asyncHandler(async (req, res) => {
    const { clients } = req.body;
    if (!Array.isArray(clients) || clients.length === 0) {
        return res.status(400).json({
            error: 'Clients array is required and cannot be empty'
        });
    }
    const results = {
        success: 0,
        failed: 0,
        errors: []
    };
    for (const clientData of clients) {
        try {
            if (!clientData.name || !clientData.phoneNumber) {
                results.failed++;
                results.errors.push(`Client missing required fields: ${JSON.stringify(clientData)}`);
                continue;
            }
            const existingClient = await prisma_1.prisma.client.findUnique({
                where: { phoneNumber: clientData.phoneNumber }
            });
            if (existingClient) {
                results.failed++;
                results.errors.push(`Duplicate phone number: ${clientData.phoneNumber}`);
                continue;
            }
            await prisma_1.prisma.client.create({
                data: {
                    name: clientData.name,
                    phoneNumber: clientData.phoneNumber,
                    email: clientData.email,
                    type: clientData.type || 'Client',
                    lastMessage: clientData.lastMessage || ''
                }
            });
            results.success++;
        }
        catch (error) {
            results.failed++;
            results.errors.push(`Error creating client ${clientData.name}: ${error.message}`);
        }
    }
    res.json(results);
    return;
}));
router.get('/:id/messages', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const client = await prisma_1.prisma.client.findUnique({
        where: { id }
    });
    if (!client) {
        return res.status(404).json({ error: 'Client not found' });
    }
    const [messages, total] = await Promise.all([
        prisma_1.prisma.message.findMany({
            where: { clientId: id },
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        }),
        prisma_1.prisma.message.count({ where: { clientId: id } })
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
    return;
}));
router.post('/:id/messages', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { text, isBot = false, whatsappMessageId, status = 'SENT' } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Message text is required' });
    }
    const client = await prisma_1.prisma.client.findUnique({
        where: { id }
    });
    if (!client) {
        return res.status(404).json({ error: 'Client not found' });
    }
    const message = await prisma_1.prisma.message.create({
        data: {
            text,
            clientId: id,
            isBot,
            whatsappMessageId,
            status,
            sentAt: new Date()
        }
    });
    await prisma_1.prisma.client.update({
        where: { id },
        data: {
            lastMessage: text,
            lastActive: new Date()
        }
    });
    res.status(201).json(message);
    return;
}));
router.get('/search/:query', asyncHandler(async (req, res) => {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    const clients = await prisma_1.prisma.client.findMany({
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
router.get('/stats/overview', asyncHandler(async (req, res) => {
    const [total, active, inactive, newThisMonth] = await Promise.all([
        prisma_1.prisma.client.count(),
        prisma_1.prisma.client.count({
            where: {
                lastActive: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        }),
        prisma_1.prisma.client.count({
            where: {
                lastActive: {
                    lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        }),
        prisma_1.prisma.client.count({
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
router.use((err, req, res, next) => {
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
    return res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});
exports.default = router;
