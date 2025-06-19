import { Request } from "express";
import { prisma } from "../../lib/prisma";
import { Response  ,} from "express";
const getQAs = async (req: Request, res: Response) => {
  const qaPairs = await prisma.qAPair.findMany({
    orderBy: { priority: "asc" },
    where: {
      isActive: true,
    },
  });
  return qaPairs;
};

const CreateQA = async (req: Request, res: Response) => {
  const { question, answer, category, language, isActive, tags, priority } =
    req.body;
  const qaPair = await prisma.qAPair.create({
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

const UpdateQA = async (req: Request, res: Response) => {
  const { id, question, answer, category, language, isActive, tags, priority } =
    req.body;
  const qaPair = await prisma.qAPair.update({
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

const DeleteQA = async (req: Request, res: Response) => {
  const { id } = req.params;
  const qaPair = await prisma.qAPair.delete({
    where: { id },
  });
  return qaPair;
};

export  {
  getQAs,
  CreateQA,
  UpdateQA,
  DeleteQA,
};
