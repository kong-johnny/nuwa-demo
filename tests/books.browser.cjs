// Start node serve.js first. Run with: node tests/books.browser.cjs
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});for(const width of [320,390,1440]){
const page=await browser.newPage({viewport:{width,height:width===1440?1000:844},isMobile:width<600,hasTouch:width<600});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:8080/web/');
await page.locator('.primary').click();await page.locator('.choice').nth(1).click();await page.locator('.primary').click();await page.locator('.primary').click();await page.locator('.primary').click();await page.locator('.choice').nth(1).click();await page.locator('.primary').click();
assert.equal(await page.evaluate(()=>demoPage.data.v.id),'S04');
for(let i=0;i<3;i++) {await page.locator('.book-toggle').nth(i).click();await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>demoPage.data.v.bookCount),i+1);assert.equal(await page.evaluate(()=>demoPage.data.bookOpen),true);if(i<2)await page.getByRole('button',{name:'下一卷 →',exact:true}).click();}
assert.equal(await page.locator('.primary').isEnabled(),true);
// Scroll, settle, and expand the newly visible book. Old detached timers must stay inert.
await page.evaluate(()=>{demoPage.bookChange({detail:{current:0}})});await page.locator('.books').evaluate(el=>el.scrollLeft=el.clientWidth);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>demoPage.data.bookIndex),1);await page.locator('.book-toggle').nth(1).click();await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>demoPage.data.bookOpen),true);
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.locator('.primary').click();assert.equal(await page.evaluate(()=>demoPage.data.v.id),'S05');await page.reload();assert.equal(await page.evaluate(()=>demoPage.data.v.id),'S05');assert.deepEqual(errors,[]);
await page.screenshot({path:require('node:path').join(require('node:os').tmpdir(),`nuwa-${width}.png`)});console.log(`${width}px: book reading, navigation, scroll stability, unlock, save and reload passed`);await page.close();}
await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
