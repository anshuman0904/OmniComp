import express from "express";
import multer from "multer";
import { compress, decompress } from "../controllers/controllers.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", (req, res) => {
  res.send("API is running...");
});
router.post("/compress", upload.single("file"), compress);
router.post("/decompress", upload.single("file"), decompress);

export default router;