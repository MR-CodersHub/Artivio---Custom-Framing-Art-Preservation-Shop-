import { spawn } from 'child_process';
import fs from 'fs';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9449;
  const userDataDir = 'C:\\Users\\dines\\.gemini\\antigravity-ide\\brain\\fb03dad4-e837-4338-ac6a-4bdf7230cb3a\\scratch\\audit_' + Date.now();

  const edge = spawn(edgePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
  const pages = await res.json();
  const page = pages.find(p => p.type === 'page') || pages[0];

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

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
    }
  };

  await new Promise(r => ws.onopen = r);
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });

  const testPages = ['index.html', 'home-2.html', 'about.html', 'services.html', 'gallery.html', 'blog.html', 'contact.html'];
  const auditReport = {};

  for (const p of testPages) {
    await send('Page.navigate', { url: `http://127.0.0.1:8080/${p}?t=${Date.now()}` });
    await new Promise(r => setTimeout(r, 1000));

    // Audit overflow elements and layout issues
    const audit = await send('Runtime.evaluate', {
      expression: `(() => {
        const docWidth = document.documentElement.clientWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const allElements = document.querySelectorAll('*');
        const overflowing = [];

        allElements.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.right > docWidth + 1 || r.left < -1) {
            // Find specific element causing overflow
            const id = el.id ? '#' + el.id : '';
            const cls = el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '';
            overflowing.push({
              tag: el.tagName,
              selector: el.tagName.toLowerCase() + id + cls,
              right: Math.round(r.right),
              left: Math.round(r.left),
              width: Math.round(r.width),
              docWidth
            });
          }
        });

        // Check sections layout
        const sections = Array.from(document.querySelectorAll('section, .hero, footer, .top-bar')).map(s => {
          const r = s.getBoundingClientRect();
          const cls = s.className && typeof s.className === 'string' ? s.className.trim() : '';
          const id = s.id || '';
          return {
            id,
            cls,
            width: Math.round(r.width),
            height: Math.round(r.height),
            top: Math.round(r.top)
          };
        });

        // Check grids and cards on mobile
        const grids = Array.from(document.querySelectorAll('[class*="grid"]')).map(g => {
          const cs = window.getComputedStyle(g);
          return {
            cls: g.className,
            display: cs.display,
            gridTemplateColumns: cs.gridTemplateColumns,
            width: g.getBoundingClientRect().width
          };
        });

        return {
          page: '${p}',
          docWidth,
          bodyScrollWidth,
          hasHorizontalScroll: bodyScrollWidth > docWidth,
          overflowCount: overflowing.length,
          overflowSamples: overflowing.slice(0, 10),
          sectionsCount: sections.length,
          grids
        };
      })()`,
      returnByValue: true
    });

    auditReport[p] = audit.result.value;
    console.log(`=== AUDIT FOR ${p} ===`);
    console.log(JSON.stringify(audit.result.value, null, 2));

    // Capture full-page screenshot
    const layoutMetrics = await send('Page.getLayoutMetrics');
    const height = Math.min(layoutMetrics.contentSize.height, 10000);
    
    // Capture first 2500px screenshot to examine sections
    const ss = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 375,
        height: Math.min(height, 3500),
        scale: 1
      }
    });
    fs.writeFileSync(`c:\\Users\\dines\\OneDrive\\Desktop\\photo\\audit_${p.replace('.html', '')}_top.png`, Buffer.from(ss.data, 'base64'));

    if (height > 3500) {
      const ss2 = await send('Page.captureScreenshot', {
        format: 'png',
        clip: {
          x: 0,
          y: 3500,
          width: 375,
          height: Math.min(height - 3500, 3500),
          scale: 1
        }
      });
      fs.writeFileSync(`c:\\Users\\dines\\OneDrive\\Desktop\\photo\\audit_${p.replace('.html', '')}_mid.png`, Buffer.from(ss2.data, 'base64'));
    }
  }

  ws.close();
  edge.kill();
  console.log('Audit completed successfully');
}

main().catch(console.error);
