"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../lib/prisma");
const getPropertyById = async (id) => {
    const property = await prisma_1.prisma.property.findUnique({
        where: { id },
    });
    return property;
};
exports.default = getPropertyById;
