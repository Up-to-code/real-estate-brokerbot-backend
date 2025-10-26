"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../lib/prisma");
const updateProperty = async (id, data) => {
    const property = await prisma_1.prisma.property.update({
        where: { id },
        data,
    });
    return property;
};
exports.default = updateProperty;
