import { Router } from "express";
import { getRecipeDetail } from "../controllers/recipeController";

const router = Router();
router.get("/:id", getRecipeDetail);

export default router;
