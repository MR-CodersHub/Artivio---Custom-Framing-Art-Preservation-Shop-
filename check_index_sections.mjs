import { spawn } from 'child_process';
import fs from 'fs';

async function main() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9452',
    '--user-data-dir=C:\\Users\\dines\\.gemini\\antigravity-ide\\brain\\fb03dad4-e837-4338-ac6a-4bdf7230cb3a\\scratch\\chk_sec2',
    'about:blank'
  ]);

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9452/json/version');
      if (res.ok) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const res = await fetch('http://127.0.0.1:9452/json/list');
  const [page] = await res.json();
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();
  const eventListeners = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    } else if (data.method && eventListeners.has(data.method)) {
      eventListeners.get(data.method)(data.params);
    }
  };

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });

  const loadPromise = new Promise(resolve => eventListeners.set('Page.loadEventFired', resolve));
  await send('Page.navigate', { url: 'http://127.0.0.1:8080/index.html' });
  await loadPromise;
  await new Promise(r => setTimeout(r, 800));

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const sections = Array.from(document.querySelectorAll('section, .hero, footer')).map((s, idx) => {
        const r = s.getBoundingClientRect();
        const cs = window.getComputedStyle(s);
        return {
          idx,
          id: s.id || '',
          cls: s.className || '',
          top: Math.round(r.top + window.scrollY),
          height: Math.round(r.height),
          display: cs.display,
          visibility: cs.visibility,
          opacity: cs.opacity
        };
      });
      return {
        url: window.location.href,
        scrollHeight: document.body.scrollHeight,
        docWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
        sections
      };
    })()`,
    returnByValue: true
  });

  console.log('Index sections:', JSON.stringify(result.result.value, null, 2));

  // Capture screenshots at each section
  const sections = result.result.value.sections;
  for (let s of sections) {
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${s.top});` });
    await new Promise(r => setTimeout(r, 200));
    const ss = await send('Page.captureScreenshot', { format: 'png' });
    const name = s.id ? s.id : (s.cls ? s.cls.split(' ')[0] : 'sec_' + s.idx);
    fs.writeFileSync(`c:\\Users\\dines\\OneDrive\\Desktop\\photo\\shot_${s.idx}_${name}.png`, Buffer.from(ss.data, 'base64'));
  }

  ws.close();
  edge.kill();
}

main().catch(console.error);
