import express from "express";
import { compress } from "../controllers/controllers.js";

const router = express.Router();

router.get("/", compress);

export default router;