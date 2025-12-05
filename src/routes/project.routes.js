import express from "express";
import {
  getAll,
  create,
  getProjectByUserLogin,
  update,
  remove,
} from "../controllers/project.controller.js";
import { protect,authorize } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.use(protect);

router.post("/", protect, create);
router.get("/", getProjectByUserLogin);
router.put("/:id", update);
router.delete("/:id", remove);
router.get("/all", getAll);
router.get("/admin", authorize("admin"), getAll);

export default router;
