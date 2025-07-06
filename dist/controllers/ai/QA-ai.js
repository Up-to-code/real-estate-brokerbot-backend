"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteQA = exports.UpdateQA = exports.CreateQA = exports.getQAs = void 0;
const prisma_1 = require("../../lib/prisma");
const getQAs = async (req, res) => {
    const qaPairs = await prisma_1.prisma.qAPair.findMany({
        orderBy: { priority: "asc" },
        where: {
            isActive: true,
        },
    });
    return qaPairs;
};
exports.getQAs = getQAs;
const CreateQA = async (req, res) => {
    const { question, answer, category, language, isActive, tags, priority } = req.body;
    const qaPair = await prisma_1.prisma.qAPair.create({
        data: {
            question,
            answer,
            category,
            language,
            isActive,
            tags,
            priority,
        },
    });
    return qaPair;
};
exports.CreateQA = CreateQA;
const UpdateQA = async (req, res) => {
    const { id, question, answer, category, language, isActive, tags, priority } = req.body;
    const qaPair = await prisma_1.prisma.qAPair.update({
        where: { id },
        data: {
            question,
            answer,
            category,
            language,
            isActive,
            tags,
            priority,
        },
    });
    return qaPair;
};
exports.UpdateQA = UpdateQA;
const DeleteQA = async (req, res) => {
    const { id } = req.params;
    const qaPair = await prisma_1.prisma.qAPair.delete({
        where: { id },
    });
    return qaPair;
};
exports.DeleteQA = DeleteQA;
