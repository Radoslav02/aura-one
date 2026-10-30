import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, protocolTimeout: 240000, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)) })
await page.goto('http://localhost:5173/en', { waitUntil: 'domcontentloaded', timeout: 60000 })
await new Promise((r) => setTimeout(r, 7000))
const samples = await page.evaluate(async () => {
  const a = [...document.querySelectorAll('header nav a')].find((x) => x.textContent.trim() === 'Product')
  const logo = document.querySelector('[data-logo]')
  const p = document.querySelectorAll('[data-panel]')
  const out = []
  a.click()
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 200))
    out.push([i * 200, location.pathname, p[0].style.transform, p[3].style.transform, getComputedStyle(logo).opacity, !!document.querySelector('main h1'), window.scrollY])
  }
  return out
})
console.log(samples.map((s) => s.join(' | ')).join('\n'))
console.log('errors:', errors.slice(0, 5))
await page.screenshot({ path: process.argv[2] || '/tmp/shot.png' })
await browser.close()
