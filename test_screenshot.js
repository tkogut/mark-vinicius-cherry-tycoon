const { chromium } = require('playwright');
const path = require('path');

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();

        await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });

        // Wait for gauges to render
        await page.waitForSelector('.animate-rise', { timeout: 10000 });

        // Find the BidModal gauge section
        const gauges = await page.$$('.flex-col.items-center.justify-center.w-full.max-w-\\[80px\\]');
        if (gauges.length > 0) {
            await gauges[0].screenshot({ path: '/home/tkogut/.gemini/antigravity/brain/227e921f-207d-4db9-9f39-386f174f8f6b/gauge_initial.png' });
        }

        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
