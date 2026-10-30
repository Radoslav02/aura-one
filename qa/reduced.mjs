import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, protocolTimeout: 240000, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
await page.goto('http://localhost:5173/sr', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 5000))
await page.screenshot({ path: 'qa/reduced-0.png' })
const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
for (const [i, f] of [0.12, 0.3, 0.5].entries()) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(total * f))
  await new Promise((r) => setTimeout(r, 1500))
  await page.screenshot({ path: `qa/reduced-${i + 1}.png` })
}
console.log('reduced errors:', errs)
await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 5000))])
process.exit(0)
