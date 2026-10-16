import { createServer } from 'node:http';
import { randomUUID, randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore, fail, text } from './store.mjs';
const scrypt=promisify(scryptCallback);
const hashToken=token=>createHash('sha256').update(token).digest('hex');
export async function passwordHash(password){const salt=randomBytes(16).toString('hex');const derived=await scrypt(password,salt,64);return `${salt}:${derived.toString('hex')}`;}
async function passwordMatches(password,stored){const [salt,key]=stored.split(':');const derived=await scrypt(password,salt,64);return timingSafeEqual(derived,Buffer.from(key,'hex'));}
export function makeServer(store,{port=3001}={}) {
  const attempts=new Map();
  const server=createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
    const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
    const path=new URL(req.url,'http://localhost').pathname;
    try{
      if(path==='/api/health')return json(200,{ok:true,app:'moneta',version:'0.6.0'});
      if(!path.startsWith('/api/')){
        const root=resolve(fileURLToPath(new URL('../dist',import.meta.url)));
        const candidate=resolve(root,`.${decodeURIComponent(path)}`);
        if(candidate!==root&&!candidate.startsWith(root+sep))return json(404,{error:'Não encontrado.'});
        const file=existsSync(candidate)&&statSync(candidate).isFile()?candidate:resolve(root,'index.html');
        if(!existsSync(file))return json(503,{error:'Execute npm run build antes de npm start.'});
        const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
        res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
        res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});return res.end(readFileSync(file));
      }
      if(req.method!=='GET'){
        if(req.headers['x-moneta-request']!=='1')fail('Requisição não autorizada.',403);
        const origin=req.headers.origin;
        if(!origin||!['http://127.0.0.1:5173','http://localhost:5173',`http://127.0.0.1:${port}`,`http://localhost:${port}`].includes(origin))fail('Origem não autorizada.',403);
        if(!req.headers['content-type']?.startsWith('application/json'))fail('Envie JSON.',415);
      }
      let body={};
      if(req.method!=='GET'){let raw='',size=0;for await(const chunk of req){size+=chunk.length;if(size>1_000_000)fail('Arquivo ou requisição acima de 1 MB.',413);raw+=chunk.toString();}try{body=JSON.parse(raw||'{}');}catch{fail('JSON inválido.');}if(!body||typeof body!=='object'||Array.isArray(body))fail('Conteúdo inválido.');}
      if(path==='/api/auth/register'||path==='/api/auth/login'){
        if(req.method!=='POST')fail('Método inválido.',405);
        const email=text(body.email,'E-mail',254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail('E-mail inválido.');
        const password=body.password;if(typeof password!=='string'||password.length<10||password.length>128)fail('A senha deve conter entre 10 e 128 caracteres.');
        const key=`${req.socket.remoteAddress}:${email}`;const previous=attempts.get(key);const rate=previous&&previous.until>Date.now()?previous:{count:0,until:Date.now()+600000};
        if(rate.count>=10)fail('Muitas tentativas. Aguarde 10 minutos.',429);rate.count++;attempts.set(key,rate);
        if(attempts.size>10000)for(const [k,v]of attempts)if(v.until<Date.now())attempts.delete(k);
        let user=store.db.prepare('SELECT * FROM users WHERE email=?').get(email);
        if(path.endsWith('register')){
          if(user)fail('Não foi possível criar a conta com este e-mail.',409);
          const name=text(body.name,'Nome',80);const encoded=await passwordHash(password);
          user={id:randomUUID(),email,name,password_hash:encoded};
          store.atomic(()=>{store.db.prepare('INSERT INTO users(id,email,name,password_hash) VALUES(?,?,?,?)').run(user.id,email,name,encoded);store.seed(user.id);});
        }else{
          // Always perform scrypt, including unknown accounts.
          const encoded=user?.password_hash||`00000000000000000000000000000000:${'0'.repeat(128)}`;
          if(!await passwordMatches(password,encoded)||!user)fail('E-mail ou senha incorretos.',401);
        }
        attempts.delete(key);const token=randomBytes(32).toString('hex');
        store.db.prepare('DELETE FROM sessions WHERE expires_at<?').run(Date.now());
        store.db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').run(hashToken(token),user.id,Date.now()+86400000);
        res.setHeader('Set-Cookie',`moneta_session=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=86400`);
        return json(200,{user:{id:user.id,email:user.email,name:user.name}});
      }
      const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('moneta_session='))?.slice(15);
      const session=token&&store.db.prepare('SELECT user_id FROM sessions WHERE token_hash=? AND expires_at>?').get(hashToken(token),Date.now());
      if(!session)fail('Sua sessão expirou. Entre novamente.',401);
      const owner=session.user_id;
      const user=store.db.prepare('SELECT id,email,name FROM users WHERE id=?').get(owner);
      if(path==='/api/me'&&req.method==='GET')return json(200,{user});
      if(path==='/api/state'&&req.method==='GET')return json(200,store.state(owner));
      if(path==='/api/mutate'&&req.method==='POST')return json(200,store.execute(owner,text(body.key,'Chave',100),text(body.action,'Operação',80),body.data||{}));
      if(path==='/api/auth/logout'&&req.method==='POST'){store.db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(token));res.setHeader('Set-Cookie','moneta_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0');return json(200,{ok:true});}
      if(path==='/api/auth/delete'&&req.method==='POST'){
        const record=store.db.prepare('SELECT password_hash FROM users WHERE id=?').get(owner);
        if(typeof body.password!=='string'||body.password.length>128||!await passwordMatches(body.password,record.password_hash))fail('Senha incorreta.',401);
        store.atomic(()=>{ // Delete children before their relational parents.
          for(const table of ['audit_events','mutation_requests','import_batches','valuation_history','notifications','contributions','goals','budgets','installments','purchases','invoice_payments','transactions','subscriptions','cards','assets','liabilities','accounts','categories','preferences'])store.db.prepare(`DELETE FROM ${table} WHERE owner_id=?`).run(owner);
          store.db.prepare('DELETE FROM users WHERE id=?').run(owner);
        });res.setHeader('Set-Cookie','moneta_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0');return json(200,{ok:true});
      }
      fail('Rota não encontrada.',404);
    }catch(e){json(e.status||500,{error:e.status?e.message:'Não foi possível concluir. Tente novamente.'});}
  });
  return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const dir=process.env.MONETA_DATA_DIR||fileURLToPath(new URL('../.local',import.meta.url));mkdirSync(dir,{recursive:true});
  const store=createStore(resolve(dir,'moneta.sqlite'));const port=Number(process.env.PORT||3001);const server=makeServer(store,{port});
  server.listen(port,'127.0.0.1',()=>console.log(`MONETA API: http://127.0.0.1:${port}`));
  server.on('error',e=>{console.error(`Não foi possível iniciar a API: ${e.code}`);process.exit(1);});
  for(const event of ['SIGINT','SIGTERM'])process.on(event,()=>server.close(()=>{store.close();process.exit(0);}));
}
