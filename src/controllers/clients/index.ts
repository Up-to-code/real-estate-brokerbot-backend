import { prisma } from "../../lib/prisma";

export const getAllClients = async () => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        messages: true,
        campaigns: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return clients;
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to get clients" };
  }
};

export const getClientById = async (id: string) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        messages: true,
        campaigns: true,
      },
    });
    return client;
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to get client" };
  }
};

export const createClient = async (client: any) => {
  try {
    const newClient = await prisma.client.create({
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
          connect: client.campaignIds.map((id: string) => ({ id })),
        },
      },
    });
    return newClient;
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to create client" };
  }
};

export const updateClient = async (id: string, client: any) => {
  try {
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name: client.name,
        phoneNumber: client.phoneNumber,
        email: client.email,
        lastActive: new Date(),
        lastMessage: client.lastMessage,
        type: client.type,
        campaigns: {
          connect: client.campaignIds.map((id: string) => ({ id })),
        },
      },
    });
    return updatedClient;
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to update client" };
  }
};

export const deleteClient = async (id: string) => {
  try {
    const deletedClient = await prisma.client.delete({ where: { id } });
    return deletedClient;
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to delete client" };
  }
};  