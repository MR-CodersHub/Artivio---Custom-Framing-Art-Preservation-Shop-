import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { WebSocket } from 'ws';

const mimeTypes = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf' };

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), reqPath.replace(/^\//, ''));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else { res.writeHead(404); res.end('Not found'); }
});

server.listen(5515, async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edgePath, ['--headless=new','--remote-debugging-port=9235','--disable-gpu','--no-first-run']);
  await new Promise(r => setTimeout(r, 1200));

  try {
    const targets = await (await fetch('http://127.0.0.1:9235/json/list')).json();
    const ws = new WebSocket((targets.find(t=>t.type==='page')||targets[0]).webSocketDebuggerUrl);
    await new Promise(resolve => ws.on('open', resolve));
    let id = 1;
    function send(method, params={}) {
      return new Promise(resolve => {
        const curId=id++;
        const handler=(msg)=>{const r=JSON.parse(msg.toString());if(r.id===curId){ws.off('message',handler);resolve(r);}};
        ws.on('message',handler);
        ws.send(JSON.stringify({id:curId,method,params}));
      });
    }
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride',{width:1200,height:900,deviceScaleFactor:1,mobile:false});

    const pages = [
      { url: 'index.html', selector: '.gallery-card', label: 'index_gallery_cards', scroll: '.gallery-card' },
      { url: 'home-2.html', selector: '.style-card', label: 'home2_style_cards', scroll: '.style-card' },
      { url: 'gallery.html', selector: '.profile-spec-card', label: 'gallery_profile_cards', scroll: '.profile-spec-card' },
      { url: 'gallery.html', selector: '.floater-spec-box', label: 'gallery_floater_boxes', scroll: '.floater-spec-box' },
      { url: 'blog.html', selector: '.hanging-spec-row, .gallery-spec-row, .hanging-guide-row, [class*="hanging"]', label: 'blog_hanging_row', scroll: '.gallery-spec-row, .hanging-spec-row, [class*="hanging"]' },
    ];

    const artDir = 'C:/Users/dines/.gemini/antigravity/brain/873eab18-eed7-4307-bdfe-ce8f9e25e816/';

    for (const p of pages) {
      await send('Page.navigate', {url:`http://127.0.0.1:5515/${p.url}`});
      await new Promise(r => setTimeout(r, 700));
      // Enable dark mode
      await send('Runtime.evaluate', {expression:`document.documentElement.setAttribute('data-theme','dark');`});
      await new Promise(r => setTimeout(r, 300));

      // Scroll to section
      const scrollR = await send('Runtime.evaluate', {expression:`(()=>{
        const el=document.querySelector('${p.scroll.replace(/'/g,'"')}');
        if(el){el.scrollIntoView({block:'center'});return true;}return false;
      })()`});
      await new Promise(r => setTimeout(r, 400));

      // Get class info
      const infoR = await send('Runtime.evaluate', {expression:`(()=>{
        const els = Array.from(document.querySelectorAll('${p.selector.replace(/'/g,'"')}'));
        return els.slice(0,3).map(el => ({
          class: el.className,
          rect: el.getBoundingClientRect(),
          children: Array.from(el.children).map(c => ({tag:c.tagName, class:c.className, text:c.innerText.slice(0,60)}))
        }));
      })()`, returnByValue:true});
      console.log(`\n=== ${p.label} ===`);
      if (infoR.result && infoR.result.result) console.log(JSON.stringify(infoR.result.result.value, null, 2));

      // Screenshot
      const clipR = await send('Runtime.evaluate', {expression:`(()=>{
        const els = Array.from(document.querySelectorAll('${p.scroll.replace(/'/g,'"')}'));
        if(!els.length) return null;
        const first=els[0].getBoundingClientRect();
        const last=els[els.length-1].getBoundingClientRect();
        const parent=els[0].closest('[class*="grid"],[class*="row"]') || els[0].parentElement;
        const pr=parent.getBoundingClientRect();
        return {x:Math.round(pr.left),y:Math.round(pr.top-20),width:Math.round(pr.width),height:Math.round(pr.height+40),scale:1};
      })()`, returnByValue:true});

      if (clipR.result && clipR.result.result && clipR.result.result.value) {
        const shot = await send('Page.captureScreenshot', {clip: clipR.result.result.value});
        if (shot.result && shot.result.data) {
          fs.writeFileSync(`${artDir}align_${p.label}.png`, Buffer.from(shot.result.data,'base64'));
          console.log(`Saved align_${p.label}.png`);
        }
      }
    }

    ws.close();
  } catch(err) { console.error(err); }
  finally { edgeProc.kill(); server.close(); process.exit(0); }
});

