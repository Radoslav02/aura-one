import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, protocolTimeout: 240000, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
await page.goto('http://localhost:5173/en', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 8000))
await page.mouse.move(400, 400)
await page.mouse.move(700, 500, { steps: 10 })
await new Promise((r) => setTimeout(r, 800))
const info = await page.evaluate(() => {
  const d = document.querySelector('.cursor-dot'), r = document.querySelector('.cursor-ring')
  const cs = (el) => el && { display: getComputedStyle(el).display, opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform, bg: getComputedStyle(el).backgroundColor, z: getComputedStyle(el).zIndex, inline: el.style.cssText }
  return { hasCursor: document.documentElement.className, dot: cs(d), ring: cs(r), hover: matchMedia('(hover: hover)').matches, coarse: matchMedia('(pointer: coarse)').matches, bodyCursor: getComputedStyle(document.body).cursor }
})
console.log(JSON.stringify(info, null, 1), 'errors:', errs)
await page.screenshot({ path: 'qa/cursor.png', clip: { x: 600, y: 400, width: 200, height: 200 } })
await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 5000))])
process.exit(0)
