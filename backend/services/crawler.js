import { CheerioCrawler, PlaywrightCrawler, RequestQueue } from 'crawlee';
import { embedAndStoreCrawledData } from './embedCrawledService.js';

const CRAWL_DELAY_MS = 1000; // Be respectful to servers
const MAX_DEPTH = 3; // Prevent infinite crawls
const VISITED_URLS = new Set(); // Deduplicate URLs

export async function crawlWebsite(startUrl, businessId) {
  console.log(`🚀 Starting crawl for ${startUrl} (businessId: ${businessId})`);

  const requestQueue = await RequestQueue.open();
  await requestQueue.addRequest({ url: startUrl, userData: { depth: 0 } });

  const cheerioCrawler = new CheerioCrawler({
    requestQueue,
    ignoreRobotsTxt: true,
    maxRequestsPerCrawl: 100,
    maxConcurrency: 3,
    requestHandlerTimeoutSecs: 60,

    async requestHandler({ request, $, enqueueLinks, log }) {
      const { depth } = request.userData;

      // Skip if already visited
      if (VISITED_URLS.has(request.url)) {
        log.info(`⏭️  Skipping duplicate: ${request.url}`);
        return;
      }
      VISITED_URLS.add(request.url);

      // Enforce depth limit
      if (depth >= MAX_DEPTH) {
        log.info(`📏 Max depth reached: ${request.url}`);
        return;
      }

      // Add crawl delay for politeness
      await new Promise(resolve => setTimeout(resolve, CRAWL_DELAY_MS));

      const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
      log.info(`Crawled (Cheerio): ${request.url}`);

      // If page looks empty or mostly JS → fallback to Playwright
      if (bodyText.length < 300) {
        console.log(`⚠️  ${request.url} looks empty – switching to Playwright...`);
        await crawlWithPlaywright(request.url, businessId);
      } else {
        await embedAndStoreCrawledData(bodyText, request.url, businessId);
      }

      // Enqueue child links with depth tracking
      await enqueueLinks({
        strategy: 'same-domain',
        transformRequestFunction(req) {
          return {
            ...req,
            userData: { depth: depth + 1 },
          };
        },
      });
    },

    async failedRequestHandler({ request, error }) {
      console.warn(`❌ Cheerio failed for: ${request.url}`);
      console.error(`   Error: ${error.message}`);
      // Could add retry logic here
    },
  });

  await cheerioCrawler.run();
  console.log('✅ Full crawl finished for', startUrl);
  VISITED_URLS.clear(); // Clean up for next crawl
}

/** Fallback for JS-heavy pages with retry logic */
async function crawlWithPlaywright(url, businessId, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const crawler = new PlaywrightCrawler({
        ignoreRobotsTxt: true,
        maxConcurrency: 1,
        headless: true,
        navigationTimeoutSecs: 15,

        async requestHandler({ page, request }) {
          console.log(`🧭 Rendering ${request.url} with Playwright (attempt ${attempt}/${retries})...`);
          
          try {
            await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
              console.log(`⚠️  Network idle timeout, proceeding anyway...`);
            });

            const html = await page.content();
            const cleanText = html
              .replace(/<[^>]*>?/gm, ' ')
              .replace(/\s+/g, ' ')
              .trim();

            if (cleanText.length > 300) {
              await embedAndStoreCrawledData(cleanText, request.url, businessId);
            } else {
              console.log(`⚠️  ${request.url} still seems empty after rendering.`);
            }
          } catch (pageError) {
            console.error(`❌ Error processing page: ${pageError.message}`);
            throw pageError;
          }
        },

        async failedRequestHandler({ request, error }) {
          if (attempt < retries) {
            console.warn(`⚠️  Playwright attempt ${attempt} failed, retrying... (${error.message})`);
          } else {
            console.warn(`❌ Playwright failed after ${retries} attempts for: ${request.url}`);
          }
          throw error;
        },
      });

      await crawler.run([url]);
      return; // Success, exit retry loop
    } catch (error) {
      if (attempt === retries) {
        console.error(`❌ Final failure for ${url}: ${error.message}`);
      }
    }
  }
}