import { Router } from "express";
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../../services/Templates/index.ts.ts";

const router = Router();

router.get("/", async (req, res) => {
  const templates = await getTemplates();
  res.json(templates);
});
router.get("/:id", async (req, res) => {
  const template = await getTemplateById(req.params.id);
  res.json(template);
});
router.post("/", async (req, res) => {
  const template = await createTemplate(req.body);
  res.json(template);
});
router.put("/:id", async (req, res) => {
  const template = await updateTemplate(req.params.id, req.body);
  res.json(template);
});

router.delete("/:id", async (req, res) => {
  const template = await deleteTemplate(req.params.id);
  res.json(template);
});

export default router;
