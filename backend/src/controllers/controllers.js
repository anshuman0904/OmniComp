import { Client } from "@gradio/client";
import fs from "fs";

/** 
 * 🧹 Helper function to delete a temp file after 1 minute
 */
function scheduleCleanup(filePath) {
  if (!filePath) return;
  setTimeout(() => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("🧹 Deleted temp upload after 1 minute:", filePath);
      }
    } catch (err) {
      console.warn("⚠️ Cleanup failed for:", filePath, err.message);
    }
  }, 60 * 1000); // 1 minute = 60000 ms
}

/**
 * 📦 Compress route handler
 */
export const compress = async (req, res) => {
  try {
    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📥 Received file for compression:", req.file.originalname, req.file.mimetype);

    const client = await Client.connect("ethanburke/OmniCompModel");
    console.log("🔗 Connected to Hugging Face Space");

    const buffer = fs.readFileSync(req.file.path);
    console.log("📄 File size:", buffer.length, "bytes");

    const fileData = new File([buffer], req.file.originalname, {
      type: req.file.mimetype,
    });

    console.log("📦 Sending file and filename to /compress_file route...");

    const result = await client.predict("/compress_file", [
      fileData,
      req.file.originalname,
    ]);

    const [infoText, fileObj] = result.data;

    console.log("✅ Compression complete!");
    console.log("📝 Info text:", infoText);
    console.log("📂 File object returned:", fileObj);

    res.status(200).json({
      message: infoText,
      compressedFileUrl: fileObj?.url,
      outputFileName: fileObj?.orig_name || req.file.originalname,
    });
  } catch (err) {
    console.error("💥 Compression error:", err);
    res.status(500).json({ error: "Compression failed", details: err.message });
  } finally {
    // Schedule cleanup (instead of deleting immediately)
    scheduleCleanup(req.file?.path);
  }
};

/**
 * 📂 Decompress route handler
 */
export const decompress = async (req, res) => {
  try {
    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📥 Received file for decompression:", req.file.originalname, req.file.mimetype);

    const client = await Client.connect("ethanburke/OmniCompModel");
    console.log("🔗 Connected to Hugging Face Space");

    const buffer = fs.readFileSync(req.file.path);
    console.log("📄 File size:", buffer.length, "bytes");

    const fileData = new File([buffer], req.file.originalname, {
      type: req.file.mimetype,
    });

    console.log("📦 Sending file and filename to /decompress_file_ui route...");

    const result = await client.predict("/decompress_file_ui", [
      fileData,
      req.file.originalname,
    ]);

    const [infoText, fileObj] = result.data;

    console.log("✅ Decompression complete!");
    console.log("📝 Info text:", infoText);
    console.log("📂 File object returned:", fileObj);

    res.status(200).json({
      message: infoText,
      decompressedFileUrl: fileObj?.url,
      outputFileName: fileObj?.orig_name || req.file.originalname,
    });
  } catch (err) {
    console.error("💥 Decompression error:", err);
    res.status(500).json({ error: "Decompression failed", details: err.message });
  } finally {
    // Schedule cleanup (instead of deleting immediately)
    scheduleCleanup(req.file?.path);
  }
};
