import { Router } from "express";
import getDashboardStatistics from "../../controllers/main";

const router = Router();
//  main route
//  @description Get dashboard statistics
//  @returns {Object} 200 OK
//  @route GET /api/v1/main
router.get("/", async (req, res) => {
  const dashboardStatistics = await getDashboardStatistics();
  res.json(dashboardStatistics);
});

export default router;
