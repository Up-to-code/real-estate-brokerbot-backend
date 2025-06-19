import { NextFunction, Request, Response, Router } from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  deleteProperty,
  updateProperty,
} from "../../controllers/properties";
const router = Router();

// Example URLs:
// GET /api/properties?city=cairo&search=apartment&minPrice=1000&maxPrice=5000&page=1&limit=10
// GET /api/properties?city=alexandria&search=villa
// GET /api/properties?minPrice=2000&maxPrice=8000
// GET /api/properties?search=furnished&page=2
// GET /api/properties?city=giza&minPrice=1500
//  @description Get all properties
//  @returns {Object} 200 OK
//  @route GET /api/v1/properties
// Simplified route
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = "1",
      limit = "10",
      city,
      search,
      minPrice,
      maxPrice,
    } = req.query;

    const filters = {
      ...(city && { city: city as string }),
      ...(search && { search: search as string }),
      ...(minPrice && { minPrice: parseFloat(minPrice as string) }),
      ...(maxPrice && { maxPrice: parseFloat(maxPrice as string) }),
    };

    const result = await getProperties(
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

//  @description Get a property by ID
//  @returns {Object} 200 OK
//  @route GET /api/v1/properties/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await getPropertyById(req.params.id);
    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
});
//  @description Create a new property
//  @returns {Object} 200 OK
//  @route POST /api/v1/properties
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await createProperty(req.body);
    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
});

//  @description Update a property by ID
//  @returns {Object} 200 OK
//  @route PUT /api/v1/properties/:id
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await updateProperty(req.params.id, req.body);
    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
});

//  @description Delete a property by ID
//  @returns {Object} 200 OK
//  @route DELETE /api/v1/properties/:id
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = await deleteProperty(req.params.id);
      res.json({ success: true, data: property });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
