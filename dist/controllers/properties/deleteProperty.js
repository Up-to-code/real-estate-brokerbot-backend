"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../lib/prisma");
const deleteProperty = async (id) => {
    const property = await prisma_1.prisma.property.delete({
        where: { id },
    });
    return property;
};
exports.default = deleteProperty;
