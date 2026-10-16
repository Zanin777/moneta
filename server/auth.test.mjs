import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createStore} from './store.mjs';
import {makeServer} from './index.mjs';
test('API: autenticação, cookies, isolamento, CSRF, logout e exclusão',async()=>{
 const store=createStore(),server=makeServer(store,{port:5173});server.listen(0,'127.0.0.1');await once(server,'listening');const url=`http://127.0.0.1:${server.address().port}`;
 async function api(path,body,cookie='',csrf=true){const res=await fetch(url+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(csrf?{'X-Moneta-Request':'1',Origin:'http://127.0.0.1:5173'}:{}),Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)});return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')};}
 try{
  assert.equal((await api('/api/state')).status,401);
  assert.equal((await api('/api/auth/register',{name:'A',email:'a@local.test',password:'1234567890'},'',false)).status,403);
  const first=await api('/api/auth/register',{name:'Ana',email:'a@local.test',password:'1234567890'});assert.equal(first.status,200);assert.ok(first.cookie.includes('HttpOnly'));assert.ok(first.cookie.includes('SameSite=Strict'));assert.equal(first.data.user.password_hash,undefined);const ca=first.cookie.split(';')[0];
  const second=await api('/api/auth/register',{name:'Bia',email:'b@local.test',password:'1234567890'});const cb=second.cookie.split(';')[0];
  const account=await api('/api/mutate',{key:'account-a',action:'account.save',data:{name:'Privada A',type:'cash',opening_balance:100,opening_date:'2026-01-01'}},ca);assert.equal(account.status,200);
  const sa=await api('/api/state',undefined,ca),sb=await api('/api/state',undefined,cb);assert.equal(sa.data.accounts.length,1);assert.equal(sb.data.accounts.length,0);
  assert.equal((await api('/api/mutate',{key:'attack',action:'account.delete',data:{id:account.data.id}},cb)).status,404);
  assert.equal((await api('/api/mutate',{key:'csrf',action:'account.delete',data:{id:account.data.id}},ca,false)).status,403);
  assert.equal((await api('/api/auth/login',{email:'a@local.test',password:'wrong-pass-123'})).status,401);
  const stored=store.db.prepare('SELECT password_hash FROM users WHERE email=?').get('a@local.test');assert.notEqual(stored.password_hash,'1234567890');assert.equal(store.db.prepare('SELECT token_hash FROM sessions').get().token_hash.length,64);
  assert.equal((await api('/api/auth/logout',{},ca)).status,200);assert.equal((await api('/api/state',undefined,ca)).status,401);
  const login=await api('/api/auth/login',{email:'a@local.test',password:'1234567890'});assert.equal(login.status,200);const fresh=login.cookie.split(';')[0];
  assert.equal((await api('/api/auth/delete',{password:'1234567890'},fresh)).status,200);assert.equal((await api('/api/state',undefined,fresh)).status,401);assert.equal((await api('/api/state',undefined,cb)).status,200);assert.equal(store.db.prepare('SELECT count(*) as n FROM users').get().n,1);
 }finally{await new Promise(resolve=>server.close(resolve));store.close();}
});
