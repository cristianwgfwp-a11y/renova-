// Run: node --test tests/conversion.test.cjs (no packages or network required).
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(s => s.trim());
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const contacts = [...html.matchAll(/<a\b[^>]*\bdata-wa-msg="[^"]*"[^>]*>/g)].map(m=>attrs(m[0]));
const buys = [...html.matchAll(/<a\b[^>]*\bdata-buy-source="[^"]*"[^>]*>/g)].map(m=>attrs(m[0]));
test('all inline scripts parse',()=>scripts.forEach(s=>new vm.Script(s)));
test('all 14 WhatsApp controls navigate natively with correct number and complete message',()=>{
  assert.equal(contacts.length,14);
  assert.equal(new Set(contacts.map(a=>a['data-source'])).size,14);
  assert.doesNotMatch(html, /<button\b[^>]*class="[^"]*wa-btn/);
  contacts.forEach(a=>{
    const url = new URL(a.href);
    assert.equal(url.origin,'https://wa.me');
    assert.equal(url.pathname,'/56995414090');
    assert.equal(url.searchParams.get('text'),a['data-wa-msg']);
    assert.ok(!a.target, 'same-tab navigation avoids popup dependency');
  });
});
test('all five checkout links retain the same Mercado Pago destination',()=>{
  assert.equal(buys.length,5);
  buys.forEach(a=>assert.equal(a.href,'https://mpago.la/1StdMG6'));
});
for(const mode of ['available','missing','throws']) {
  test(`contact and checkout handlers preserve navigation when tracking is ${mode}`,()=>{
    const events=[];
    const makeNode = attributes=>({getAttribute:k=>attributes[k],addEventListener(type,fn){this[type]=fn;}});
    const wa=contacts.map(makeNode), buy=buys.map(makeNode);
    const document={
      addEventListener(type,fn){if(type==='DOMContentLoaded')fn();},
      querySelector(){return null;},
      querySelectorAll(selector){return selector==='.wa-btn'?wa:selector==='a.buy-btn'?buy:[];}
    };
    const window={};
    const context={window,document,console:{warn(){}},Set};
    if(mode!=='missing')context.fbq=(...args)=>{if(mode==='throws')throw new Error('TEST tracking failure');events.push(args);};
    vm.runInNewContext(scripts.at(-1),context);
    wa.forEach(a=>a.click(Object.freeze({preventDefault(){throw Error('Navigation cancelled');}})));
    buy.forEach(a=>a.click(Object.freeze({preventDefault(){throw Error('Navigation cancelled');}})));
    if(mode==='available'){
      assert.equal(events.filter(e=>e[1]==='Contact').length,14);
      const checkout=events.filter(e=>e[1]==='InitiateCheckout');
      assert.equal(checkout.length,5);
      checkout.forEach(e=>{assert.equal(e[2].value,49990);assert.equal(e[2].currency,'CLP');});
    }
  });
}
test('one PageView initialization; never declare a Purchase on a click',()=>{
  assert.equal((html.match(/fbq\('init', '1616701470198212'\)/g)||[]).length,1);
  assert.equal((html.match(/fbq\('track', 'PageView'\)/g)||[]).length,1);
  assert.doesNotMatch(html,/fbq\('track', 'Purchase'/);
});
