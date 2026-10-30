import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, protocolTimeout: 240000, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] })
const page = await browser.newPage()
await page.setViewport({ width: 1350, height: 940 })
await page.evaluateOnNewDocument(() => {
  window.__shifts = []
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      window.__shifts.push({
        t: Math.round(e.startTime), v: +e.value.toFixed(4), scrollY: window.scrollY, docH: document.documentElement.scrollHeight,
        src: e.sources.map((s) => ({ node: s.node && (s.node.tagName + '.' + (s.node.className || '').toString().slice(0, 40)), prev: s.previousRect && [s.previousRect.y, s.previousRect.height], cur: s.currentRect && [s.currentRect.y, s.currentRect.height] })),
      })
    }
  }).observe({ type: 'layout-shift', buffered: true })
})
await page.goto('http://localhost:4173/en', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 9000))
const shifts = await page.evaluate(() => window.__shifts)
console.log(JSON.stringify(shifts, null, 1).slice(0, 4000))
await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 5000))])
process.exit(0)
