import express from "express";
import { crawlWebsite } from "../services/crawler.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();


router.post("/crawl", async (req, res) => {
  const { websiteUrl, businessId } = req.body;

  if (!websiteUrl) {
    return res.status(400).json({ error: "Website URL required" });
  }

  // Crawl asynchronously
  crawlWebsite(websiteUrl, businessId)
    .then(() => console.log(`Crawl completed for ${websiteUrl}`))
    .catch(err => console.error("Crawl error:", err));

  res.json({ success: true, message: "Crawling started in background" });
});

export default router;
