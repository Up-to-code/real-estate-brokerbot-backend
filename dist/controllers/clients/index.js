"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClientById = exports.getAllClients = void 0;
const prisma_1 = require("../../lib/prisma");
const getAllClients = async () => {
    try {
        const clients = await prisma_1.prisma.client.findMany({
            include: {
                messages: true,
                campaigns: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return clients;
    }
    catch (err) {
        console.error(err);
        return { success: false, error: "Failed to get clients" };
    }
};
exports.getAllClients = getAllClients;
const getClientById = async (id) => {
    try {
        const client = await prisma_1.prisma.client.findUnique({
            where: { id },
            include: {
                messages: true,
                campaigns: true,
            },
        });
        return client;
    }
    catch (err) {
        console.error(err);
        return { success: false, error: "Failed to get client" };
    }
};
exports.getClientById = getClientById;
const createClient = async (client) => {
    try {
        const newClient = await prisma_1.prisma.client.create({
            data: {
                name: client.name,
                phoneNumber: client.phoneNumber,
                email: client.email,
                lastActive: new Date(),
                lastMessage: client.lastMessage,
                createdAt: new Date(),
                updatedAt: new Date(),
                type: client.type,
                campaigns: {
                    connect: client.campaignIds.map((id) => ({ id })),
                },
            },
        });
        return newClient;
    }
    catch (err) {
        console.error(err);
        return { success: false, error: "Failed to create client" };
    }
};
exports.createClient = createClient;
const updateClient = async (id, client) => {
    try {
        const updatedClient = await prisma_1.prisma.client.update({
            where: { id },
            data: {
                name: client.name,
                phoneNumber: client.phoneNumber,
                email: client.email,
                lastActive: new Date(),
                lastMessage: client.lastMessage,
                type: client.type,
                campaigns: {
                    connect: client.campaignIds.map((id) => ({ id })),
                },
            },
        });
        return updatedClient;
    }
    catch (err) {
        console.error(err);
        return { success: false, error: "Failed to update client" };
    }
};
exports.updateClient = updateClient;
const deleteClient = async (id) => {
    try {
        const deletedClient = await prisma_1.prisma.client.delete({ where: { id } });
        return deletedClient;
    }
    catch (err) {
        console.error(err);
        return { success: false, error: "Failed to delete client" };
    }
};
exports.deleteClient = deleteClient;
