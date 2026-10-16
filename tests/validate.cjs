/* Browser regression tests. The local server mocks Netlify, never sends real orders. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.equal((html.match(/fbq\('init'/g) || []).length, 1);
assert.equal((html.match(/fbq\('track', 'PageView'/g) || []).length, 1);
assert.ok(html.includes("fbq('init', '1616701470198212')"));
assert.ok(!/['"]Purchase['"]/.test(html + fs.readFileSync(path.join(root, 'checkout.js'), 'utf8')));
assert.ok(html.includes('data-netlify="true"'));
assert.ok(html.includes('netlify-honeypot="bot-field"'));
let submissions = [], mode = 'success', browser;
const server = http.createServer((request, response) => {
    if (request.method === 'POST') {
        let body = '';
        request.on('data', chunk => body += chunk);
        request.on('end', () => {
            submissions.push(Object.fromEntries(new URLSearchParams(body)));
            setTimeout(() => {
                response.writeHead(mode === 'error' ? 503 : 200, { 'Content-Type': 'text/html' });
                response.end(mode === 'error' ? 'Unavailable' : 'Netlify test fixture accepted');
            }, 150);
        });
        return;
    }
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const filename = path.join(root, pathname === '/' ? 'index.html' : pathname);
    if (!filename.startsWith(root) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
        response.writeHead(404); response.end('Not found'); return;
    }
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png' };
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'text/plain' });
    response.end(fs.readFileSync(filename));
});
async function runNativeLinkChecks(browser, url) {
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    await nojs.route('https://www.facebook.com/**', route => route.abort());
    await nojs.route('https://wa.me/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>WhatsApp navigation test fixture</h1>' }));
    const page = await nojs.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    // Real clicks with page JavaScript disabled: no contact handler can help navigation.
    await page.locator('#consultas summary').click();
    const sources = await page.locator('.wa-btn').evaluateAll(es => es.filter(e=>e.getClientRects().length).map(e=>e.dataset.source));
    assert.equal(sources.length, 16, 'All static contacts remain reachable; confirmation CTA is intentionally hidden until submission');
    for (const source of sources) {
        const link = page.locator('[data-source="'+source+'"]');
        const href = await link.getAttribute('href');
        await link.click({ force: true });
        await page.waitForURL('https://wa.me/**');
        assert.equal(page.url(), href);
        await page.goBack({ waitUntil: 'networkidle' });
        if (await page.locator('#consultas details').getAttribute('open') === null) await page.locator('#consultas summary').click();
    }
    // Native required fields and POST without JavaScript, including region/contact/consent.
    const before = submissions.length;
    await page.locator('#nombre').fill('PRUEBA SIN JS'); await page.locator('#apellido').fill('LOCAL ONLY');
    await page.locator('#telefono').fill('+56000000000'); await page.locator('#email').fill('test@example.invalid');
    await page.locator('#tipo_entrega').selectOption('La Serena'); await page.locator('#region').selectOption('Coquimbo');
    await page.locator('#comuna').fill('La Serena'); await page.locator('#direccion').fill('PRUEBA NO ENTREGAR'); await page.locator('#numero').fill('Sin número');
    await page.locator('#privacidad').check(); await page.locator('#submit-order').click();
    await page.waitForURL('**/pedido-recibido.html');
    assert.equal(submissions.length,before+1); assert.equal(submissions.at(-1).region,'Coquimbo'); assert.equal(submissions.at(-1)['form-name'],'pedido-renova');
    await nojs.close();
    for (const tracking of ['missing','throws']) {
        const context = await browser.newContext();
        await context.route('https://connect.facebook.net/**',route=>route.fulfill({contentType:'text/javascript',body:''}));
        const page = await context.newPage(); await page.goto(url,{waitUntil:'networkidle'});
        await page.evaluate(mode=>{window.fbq=mode==='missing'?undefined:()=>{throw Error('TEST tracking unavailable');};document.querySelectorAll('.wa-btn').forEach(link=>link.addEventListener('click',e=>e.preventDefault()));},tracking);
        await page.locator('#consultas summary').click();
        for (const link of await page.locator('.wa-btn').all()) {
            if (await link.isVisible()) {const href=await link.getAttribute('href');await link.click({force:true});assert.ok(href.startsWith('https://wa.me/56995414090?text='));}
        }
        await context.close();
    }
    console.log('PASS: 16 real WhatsApp navigations with JavaScript disabled, native form POST, and contact handlers with missing/throwing tracking.');
}

async function run() {
    await new Promise(resolve => server.listen(4173, '127.0.0.1', resolve));
    browser = await chromium.launch({ headless: true, ...(process.env.QA_BROWSER ? { executablePath: process.env.QA_BROWSER } : {}) });
    const context = await browser.newContext();
    // Preserve the real inline initialization; only mock the external Pixel transport.
    await context.route('https://connect.facebook.net/**', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.addInitScript(() => {
        window.__opened = [];
        window.open = (...args) => { window.__opened.push(args); return null; };
    });
    const page = await context.newPage();
    let errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = 'http://127.0.0.1:4173/?utm_source=meta&utm_medium=paid&utm_campaign=v3&utm_content=ad1&fbclid=test-click';
    await page.goto(url, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('nav').evaluate(el => Math.round(el.getBoundingClientRect().height)), 65, 'Tailwind must load for a representative rendering');
    assert.deepEqual(await page.evaluate(() => fbq.queue.map(item => Array.from(item))), [['init', '1616701470198212'], ['track', 'PageView']]);
    const output = path.join(root, '.qa'); fs.mkdirSync(output, { recursive: true });
    for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(150);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Overflow at ' + width);
        for (const target of ['#pedido', '#faq', 'footer']) {
            await page.locator(target).scrollIntoViewIfNeeded();
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Overflow at ' + width + ' ' + target);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        assert.ok(await page.locator('[data-buy-source="hero"]').evaluate(el => el.getBoundingClientRect().bottom <= innerHeight), 'Hero CTA above fold at ' + width);
        await page.screenshot({ path: path.join(output, 'responsive-' + width + '.png'), fullPage: true });
        if (width === 390 || width === 1440) await page.screenshot({ path: path.join(output, 'hero-' + width + '.png') });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.menu-toggle').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await page.locator('.menu-toggle').click(); await page.locator('#nav-links a[href="#faq"]').click();
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await page.locator('.faq-item summary').first().click();
    assert.equal(await page.locator('.faq-item').first().getAttribute('open'), '');
    await page.locator('.faq-item summary').first().click();
    assert.equal(await page.locator('.faq-item').first().getAttribute('open'), null);
    await page.locator('[data-buy-source="hero"]').click();
    assert.equal(await page.evaluate(() => fbq.queue.filter(item => item[1] === 'InitiateCheckout').length), 0);
    await page.locator('#submit-order').click();
    assert.equal(submissions.length, 0, 'Empty form cannot submit');
    assert.ok(await page.locator('#order-confirmation').isHidden());
    await page.locator('#nombre').fill('Cliente'); await page.locator('#apellido').fill('Prueba');
    await page.locator('#telefono').fill('abcdefgh'); await page.locator('#email').fill('prueba@example.com');
    await page.locator('#tipo_entrega').selectOption('La Serena');
    assert.equal(await page.locator('#comuna').inputValue(), 'La Serena');
    assert.equal(await page.locator('#region').inputValue(), 'Coquimbo');
    await page.locator('#tipo_entrega').selectOption('Coquimbo');
    assert.equal(await page.locator('#comuna').inputValue(), 'Coquimbo');
    await page.locator('#direccion').fill('Calle de prueba'); await page.locator('#numero').fill('Sin número');
    await page.locator('#submit-order').click(); assert.equal(submissions.length, 0, 'Privacy consent required');
    await page.locator('#privacidad').check(); await page.locator('#submit-order').click();
    assert.equal(submissions.length, 0, 'Invalid phone blocked');
    await page.locator('#telefono').fill('+56 9 1234 5678');
    await context.route('**/pedido-recibido.html', route=>route.abort('failed'));
    await page.locator('#submit-order').click();
    await page.waitForFunction(()=>document.querySelector('#order-status').textContent.includes('No pudimos'));
    assert.ok(await page.locator('#order-confirmation').isHidden(), 'Network failure must not expose checkout');
    assert.equal(await page.evaluate(()=>fbq.queue.filter(item=>item[1]==='Lead').length),0);
    await context.unroute('**/pedido-recibido.html');
    mode = 'error'; await page.locator('#submit-order').click();
    await page.waitForFunction(() => document.querySelector('#order-status').textContent.includes('No pudimos'));
    assert.ok(await page.locator('#order-confirmation').isHidden());
    assert.equal(await page.evaluate(() => fbq.queue.filter(item => item[1] === 'Lead').length), 0);
    const retryReference = submissions.at(-1).referencia;
    mode = 'success';
    await page.locator('#submit-order').click();
    await page.evaluate(() => document.querySelector('#order-form').requestSubmit());
    await page.locator('#order-confirmation').waitFor({ state: 'visible' });
    await page.locator('#order-confirmation').screenshot({ path: path.join(output, 'order-card-local.png') });
    assert.equal(submissions.length, 2, 'One failed request and one success; pending submit cannot duplicate');
    const order = submissions.at(-1);
    assert.equal(order['form-name'], 'pedido-renova'); assert.equal(order.region, 'Coquimbo');
    assert.equal(order.comuna, 'Coquimbo'); assert.equal(order.privacidad, 'Acepto');
    assert.equal(order.referencia, retryReference); assert.match(order.referencia, /^RNV-[A-F0-9]{12}$/);
    for (const key of ['nombre', 'apellido', 'telefono', 'email', 'region', 'comuna', 'direccion', 'numero', 'tipo_entrega', 'fecha_hora', 'url_origen', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid']) assert.ok(order[key], key + ' is sent');
    assert.equal(order.utm_source, 'meta'); assert.equal(order.precio_clp, '49990'); assert.equal(order.envio_clp,'0'); assert.equal(order.total_clp,'49990');
    assert.ok(!order.url_origen.includes('?'));
    assert.equal(await page.evaluate(() => fbq.queue.filter(item => item[1] === 'Lead').length), 1);
    await page.evaluate(() => document.querySelector('#order-form').requestSubmit());
    assert.equal(submissions.length, 2, 'Saved form cannot resubmit');
    assert.equal(await page.locator('#payment-link').getAttribute('href'), 'https://mpago.la/1StdMG6');
    await page.evaluate(() => document.querySelector('#coordinate-order').addEventListener('click', event => event.preventDefault()));
    await page.locator('#coordinate-order').click();
    const opened = await page.locator('#coordinate-order').getAttribute('href');
    assert.ok(opened.startsWith('https://wa.me/56995414090?text='));
    assert.ok(decodeURIComponent(opened).includes(order.referencia));
    assert.ok(!opened.includes('example.com')); assert.ok(!decodeURIComponent(opened).includes('Calle de prueba'));
    assert.equal(await page.evaluate(() => fbq.queue.filter(item => item[1] === 'Contact').length), 1);
    // Cancel navigation after the checkout listener so no external payment is started.
    await page.evaluate(() => document.querySelector('#payment-link').addEventListener('click', event => event.preventDefault()));
    await page.locator('#payment-link').click();
    assert.equal(await page.evaluate(() => fbq.queue.filter(item => item[1] === 'InitiateCheckout').length), 1);
    await page.screenshot({ path: path.join(output, 'confirmation-local.png'), fullPage: true });
    await page.reload({ waitUntil: 'networkidle' });
    assert.ok(await page.locator('#order-confirmation').isHidden(), 'No personal data restored from browser storage');
    await page.locator('#nombre').fill('Cliente'); await page.locator('#apellido').fill('Regiones');
    await page.locator('#telefono').fill('+56 9 1234 5678'); await page.locator('#email').fill('regiones@example.com');
    await page.locator('#tipo_entrega').selectOption('La Serena');
    await page.locator('#tipo_entrega').selectOption('Despacho');
    assert.ok(await page.locator('#region').isEnabled()); assert.equal(await page.locator('#comuna').inputValue(), '');
    await page.locator('#region').selectOption('Valparaíso'); await page.locator('#comuna').fill('Viña del Mar');
    await page.locator('#direccion').fill('Camino de prueba'); await page.locator('#numero').fill('123, depto. 4'); await page.locator('#privacidad').check();
    await page.locator('#submit-order').click(); await page.locator('#order-confirmation').waitFor({ state: 'visible' });
    assert.ok(await page.locator('#dispatch-warning').isVisible()); assert.equal(submissions.at(-1).region, 'Valparaíso');
    assert.ok((await page.locator('#coordinate-order').textContent()).includes('despacho'));
    assert.equal(await page.evaluate(() => fbq.queue.filter(item => item[1] === 'Lead').length), 1);
    for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Confirmation overflow at ' + width);
    }
    await page.screenshot({ path: path.join(output, 'confirmation-dispatch.png'), fullPage: true });
    const anchors = await page.locator('a[href^="#"]').evaluateAll(elements => elements.map(el => el.getAttribute('href')));
    for (const href of anchors) assert.equal(await page.locator(href).count(), 1, 'Valid anchor ' + href);
    const images = await page.locator('img').evaluateAll(elements => elements.filter(el => !el.closest('noscript')).map(el => ({ alt: el.getAttribute('alt'), valid: el.complete && el.naturalWidth > 0 })));
    assert.ok(images.every(image => image.alt && image.valid), 'Images have alt and resolve');
    const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
    assert.equal(storage.local.length, 0); assert.deepEqual(storage.session, ['renova-attribution']);
    const contactBefore = await page.evaluate(() => fbq.queue.filter(item=>item[1]==='Contact').length);
    await page.evaluate(() => document.querySelectorAll('.wa-btn').forEach(link=>{link.addEventListener('click',e=>e.preventDefault());link.click();}));
    assert.equal(await page.evaluate(() => fbq.queue.filter(item=>item[1]==='Contact').length),contactBefore+17,'Each of 17 contacts tracks exactly once');
    assert.deepEqual(errors, []);
    await runNativeLinkChecks(browser, url);
    await browser.close();
    console.log('PASS: 7 responsive widths, menu, FAQ, required fields, phone, consent, local/dispatch, error/retry, duplicate prevention, attribution payload, payment URL, Pixel event counts, images, anchors and no JS errors.');
    console.log('Netlify POST is mocked locally: live storage and Meta delivery need Deploy Preview verification.');
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); server.close(); });
