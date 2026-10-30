import puppeteer from 'puppeteer-core'
const [,, path = '/en/product', name = 'product', width = '1440', height = '900', steps = '7'] = process.argv
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, protocolTimeout: 240000, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal', '--autoplay-policy=no-user-gesture-required'] })
const page = await browser.newPage()
await page.setViewport({ width: +width, height: +height, deviceScaleFactor: 1, isMobile: +width < 800, hasTouch: +width < 800 })
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)) })
await page.goto('http://localhost:5173' + path, { waitUntil: 'domcontentloaded', timeout: 60000 })
await new Promise((r) => setTimeout(r, 7000))
const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
for (let i = 0; i < +steps; i++) {
  const y = Math.round((total * i) / (+steps - 1))
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y)
  // let Lenis + ScrollTrigger settle
  await new Promise((r) => setTimeout(r, 1800))
  await page.screenshot({ path: `qa/${name}-${i}.png` })
}
console.log(name, 'height', total, 'errors:', errors.slice(0, 6))
await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 5000))])
process.exit(0)
