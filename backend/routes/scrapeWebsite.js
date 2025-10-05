// routes/scrapeWebsite.js
import express from "express";
import puppeteer from "puppeteer";
import embedAndStore from "../utils/embedAndStore.js"; // adjust path if needed

const router = express.Router();

// Scrape website and extract structured sections
async function scrapeWebsite(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Extract headings and paragraphs
    const sections = await page.evaluate(() => {
      const content = [];
      const elements = document.querySelectorAll("h1, h2, h3, p");
      let currentSection = { title: null, text: "" };

      elements.forEach(el => {
        if (["H1", "H2", "H3"].includes(el.tagName)) {
          if (currentSection.text.trim()) content.push({ ...currentSection });
          currentSection = { title: el.innerText.trim(), text: "" };
        } else if (el.tagName === "P") {
          currentSection.text += " " + el.innerText.trim();
        }
      });

      if (currentSection.text.trim()) content.push({ ...currentSection });

      return content;
    });

    return sections;
  } catch (err) {
    console.error("Scrape error:", err);
    return null;
  } finally {
    await browser.close();
  }
}

// Chunk text into smaller pieces
function chunkText(text, maxLength = 500) {
  const words = text.split(/\s+/);
  const chunks = [];
  let chunk = [];

  for (const word of words) {
    chunk.push(word);
    if (chunk.join(" ").length >= maxLength) {
      chunks.push(chunk.join(" "));
      chunk = [];
    }
  }

  if (chunk.length) chunks.push(chunk.join(" "));
  return chunks;
}

// POST /api/scrape-website
router.post("/", async (req, res) => {
  console.log("Received body:", req.body);
  const { url, businessId } = req.body;

  if (!url || !businessId) {
    return res.status(400).json({ error: "url and businessId are required" });
  }

  const sections = await scrapeWebsite(url);
  if (!sections || sections.length === 0) {
    return res.status(500).json({ error: "Failed to scrape website or no content found" });
  }

  try {
    for (const section of sections) {
      const textChunks = chunkText(section.text, 500);

      for (let i = 0; i < textChunks.length; i++) {
        await embedAndStore({
          content: textChunks[i],
          metadata: {
            businessId,                    // same businessId for all chunks
            filename: url,
            sectionTitle: section.title
              ? `${section.title}-${i + 1}`
              : `section-${i + 1}`
          }
        });
      }
    }

    res.json({ message: "Website scraped, chunked, and stored in Pinecone ✅" });
  } catch (err) {
    console.error("Embedding/Pinecone error:", err);
    res.status(500).json({ error: "Error embedding or storing data" });
  }
});

export default router;
