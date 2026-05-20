import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { CategoryController } from "./category.controller";
import {
  createCategoryValidation,
  deleteCategoryValidation,
  updateCategoryValidation,
} from "./category.validation";

const categoryRoutes = Router();
const categoryController = new CategoryController();

categoryRoutes.use(authMiddleware);

categoryRoutes.get("/", categoryController.list);

categoryRoutes.post(
  "/",
  validateRequest(createCategoryValidation),
  categoryController.create
);

categoryRoutes.put(
  "/:id",
  validateRequest(updateCategoryValidation),
  categoryController.update
);

categoryRoutes.delete(
  "/:id",
  validateRequest(deleteCategoryValidation),
  categoryController.delete
);

export { categoryRoutes };