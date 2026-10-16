const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'), checkout=fs.readFileSync(path.join(__dirname,'../checkout.js'),'utf8');
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const contacts=[...html.matchAll(/<a\b[^>]*class="[^"]*\bwa-btn\b[^>]*>/g)].map(m=>attrs(m[0]));
const sources=['navbar','hero','ingredients','price','id_piel_unas','id_articulaciones','id_rutina','id_ingredientes','price_1','price_3','price_7plus','final_cta','footer','floating'];
test('all 14 PR5 contact paths and 3 V3 contact paths have native encoded WhatsApp URLs',()=>{
 assert.equal(contacts.length,17);for(const source of [...sources,'seller','multiple_units','order_confirmation'])assert.equal(contacts.filter(a=>a['data-source']===source).length,1,source);
 for(const a of contacts){const url=new URL(a.href);assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/56995414090');assert.equal(url.searchParams.get('text'),a['data-wa-msg']);assert.ok(!a.target);}
 assert.doesNotMatch(html,/<button\b[^>]*class="[^"]*wa-btn/);assert.doesNotMatch(checkout,/window\.open/);
});
test('one Pixel init and PageView; Contact, Lead and checkout retained; no invented purchase event',()=>{
 assert.equal((html.match(/fbq\('init', '1616701470198212'\)/g)||[]).length,1);assert.equal((html.match(/fbq\('track', 'PageView'\)/g)||[]).length,1);
 for(const e of ['Contact','Lead','InitiateCheckout'])assert.ok(checkout.includes("track('"+e+"'"));
 assert.doesNotMatch(html+checkout,/['"]Purchase['"]/);
});
test('all scripts parse',()=>{for(const s of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(s[1]);new vm.Script(checkout);});
test('form remains Netlify POST with honeypot, consent, address and campaign fields',()=>{assert.match(html, /name="pedido-renova"[^>]*method="POST"[^>]*action="\/pedido-recibido.html"[^>]*data-netlify="true"/);for(const name of ['form-name','bot-field','nombre','apellido','telefono','email','region','comuna','direccion','numero','privacidad','referencia','utm_source','utm_medium','utm_campaign','utm_content','fbclid'])assert.ok(html.includes('name="'+name+'"'),name);assert.ok(fs.existsSync(path.join(__dirname,'../pedido-recibido.html')));});
test('price and actual payment destination preserved; free delivery is not asserted without confirmation',()=>{assert.match(html,/\$49\.990/);assert.match(html,/id="payment-link" href="https:\/\/mpago.la\/1StdMG6"/);assert.doesNotMatch(html+checkout,/sin costo|gratis|24 horas|48 horas/i);});
