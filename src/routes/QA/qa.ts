import express, { Response } from "express";
import { getQAs, CreateQA, UpdateQA, DeleteQA } from "../../controllers/ai/QA-ai"; // غيّر المسار إذا لزم

const router = express.Router();

// جلب كل الأسئلة
router.get("/", async (req, res: Response) => {
  try {
    const data = await getQAs(req, res);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "فشل في جلب البيانات" });
  }
});

// إنشاء سؤال جديد
router.post("/", async (req, res) => {
  try {
    const data = await CreateQA(req, res);
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "فشل في الإنشاء" });
  }
});

// تعديل سؤال
router.put("/:id", async (req, res) => {
  try {
    req.body.id = req.params.id;
    const data = await UpdateQA(req, res);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "فشل في التحديث" });
  }
});

// حذف سؤال
router.delete("/:id", async (req, res) => {
  try {
    const data = await DeleteQA(req, res);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "فشل في الحذف" });
  }
});

export default router;
