import { crawlWebsite } from "./services/crawler.js";
import dotenv from "dotenv";
dotenv.config();

const url = "https://login.com/"; // try with your customer’s site too
const businessId = "demo-business";

crawlWebsite(url, businessId)
  .then(() => console.log("✅ Crawl + chunk preview finished"))
  .catch(err => console.error("❌ Error:", err));
