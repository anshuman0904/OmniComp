import { Client } from "@gradio/client";
import fs from "fs";

// Helper function to delete the temporary uploaded file after 120 seconds.
function scheduleCleanup(filePath) {
  if (!filePath) return;
  setTimeout(() => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Deleted temp upload after 1 minute:", filePath);
      }
    } catch (err) {
      console.warn("Cleanup failed for:", filePath, err.message);
    }
  }, 120 * 1000); // s to ms
}

// compress route handler
export const compress = async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Received file for compression:", req.file.originalname, req.file.mimetype);

    const client = await Client.connect("ethanburke/OmniCompModel");
    console.log("Connected to Hugging Face Space");

    const buffer = fs.readFileSync(req.file.path);
    console.log("File size:", buffer.length, "bytes");

    const fileData = new File([buffer], req.file.originalname, {
      type: req.file.mimetype,
    });

    console.log("Sending file and filename to /compress_file route on Hugging Face");

    const result = await client.predict("/compress_file", [
      fileData,
      req.file.originalname,
    ]);

    let [infoJson, fileObj] = result.data;
    // Handle stringified JSON from Gradio (Hugging Face)
    if (typeof infoJson === "string") {
      try {
        infoJson = JSON.parse(
          infoJson
            .replace(/'/g, '"') // convert single quotes to double quotes
            .replace(/None/g, 'null') // Python to JSON
            .replace(/True/g, 'true')
            .replace(/False/g, 'false')
        );
      } catch (parseErr) {
        console.warn("Failed to parse infoJson, raw value:", infoJson);
      }
    }

    console.log("Compression complete!");
    console.log("Compression info:", infoJson);
    console.log("File object returned:", fileObj);

    res.status(200).json({
      algorithm: infoJson.algorithm,
      compressionRatio: infoJson.compression_ratio,
      reductionPercent: infoJson.reduction_percent,
      originalSize: infoJson.original_size,
      compressedSize: infoJson.compressed_size,
      compressedFileUrl: fileObj?.url,
      outputFileName: fileObj?.orig_name || req.file.originalname,
    });
  } catch (err) {
    console.error("Compression error:", err);
    res.status(500).json({ error: "Compression failed", details: err.message });
  } finally {
    scheduleCleanup(req.file?.path);
  }
};

// decompress route handler
export const decompress = async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Received file for decompression:", req.file.originalname, req.file.mimetype);

    const client = await Client.connect("ethanburke/OmniCompModel");
    console.log("Connected to Hugging Face Space");

    const buffer = fs.readFileSync(req.file.path);
    console.log("File size:", buffer.length, "bytes");

    const fileData = new File([buffer], req.file.originalname, {
      type: req.file.mimetype,
    });

    console.log("Sending file and filename to /decompress_file_ui route on Hugging Face");

    const result = await client.predict("/decompress_file_ui", [
      fileData,
      req.file.originalname,
    ]);

    let [infoJson, fileObj] = result.data;

    // Handle stringified JSON from Gradio (Hugging Face)
    if (typeof infoJson === "string") {
      try {
        infoJson = JSON.parse(
          infoJson
            .replace(/'/g, '"') // convert single quotes to double quotes
            .replace(/None/g, 'null') // Python to JSON
            .replace(/True/g, 'true')
            .replace(/False/g, 'false')
        );
      } catch (parseErr) {
        console.warn("Failed to parse infoJson, raw value:", infoJson);
      }
    }

    console.log("Decompression complete!");
    console.log("Decompression info:", infoJson);
    console.log("File object returned:", fileObj);

    res.status(200).json({
      algorithm: infoJson.algorithm,
      restoredFileName: infoJson.restored_file_name,
      decompressedFileUrl: fileObj?.url
    });
  } catch (err) {
    console.error("Decompression error:", err);
    res.status(500).json({ error: "Decompression failed", details: err.message });
  } finally {
    scheduleCleanup(req.file?.path);
  }
};