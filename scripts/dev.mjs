import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cwd=fileURLToPath(new URL('..',import.meta.url));
try {
 const health=await fetch('http://127.0.0.1:5173/api/health',{signal:AbortSignal.timeout(1000)}).then(r=>r.json());
 if(health.app==='moneta'){
  const url='http://127.0.0.1:5173/landing.html';console.log(`MONETA já está em execução: ${url}`);
  if(process.argv.includes('--open')&&process.platform==='win32')spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{windowsHide:true,detached:true,stdio:'ignore'}).unref();
  process.exit(0);
 }
}catch{/* Start the local services below. */}
const children=[spawn(process.execPath,['server/index.mjs'],{cwd,stdio:'inherit'}),spawn(process.execPath,['node_modules/vite/bin/vite.js',...process.argv.slice(2)],{cwd,stdio:'inherit'})];
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill();setTimeout(()=>process.exit(code),250);}
for(const child of children){child.on('error',()=>stop(1));child.on('exit',code=>stop(code||0));}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
