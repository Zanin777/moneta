export interface User {id:string;email:string;name:string}
export interface Account {id:string;name:string;type:string;institution:string;opening_balance:number;opening_date:string}
export interface Category {id:string;name:string;kind:'income'|'expense';color:string}
export interface Transaction {id:string;description:string;amount:number;kind:'income'|'expense'|'transfer';status:'settled'|'pending';account_id:string;destination_id:string|null;category_id:string|null;date:string;time:string;notes:string;subscription_id:string|null}
export interface CreditCard {id:string;name:string;last_four:string;credit_limit:number;closing_day:number;due_day:number}
export interface Purchase {id:string;card_id:string;category_id:string;description:string;amount:number;date:string;count:number}
export interface Installment {id:string;purchase_id:string;card_id:string;category_id:string;number:number;amount:number;due_date:string}
export interface Payment {id:string;card_id:string;account_id:string;month:string;amount:number;date:string}
export interface Budget {id:string;month:string;category_id:string;amount:number;attention:number;near_limit:number}
export interface Goal {id:string;name:string;description:string;target:number;desired_date:string;status:'active'|'completed'|'archived';kind:'virtual'|'segregated';account_id:string|null}
export interface Contribution {id:string;goal_id:string;amount:number;date:string;note:string}
export interface Subscription {id:string;name:string;amount:number;account_id:string;category_id:string;frequency:string;next_date:string;status:string;kind:'income'|'expense'}
export interface Valuation {id:string;name:string;amount:number;date:string}
export interface ValuationHistory {id:string;entity_type:'assets'|'liabilities';entity_id:string;amount:number;date:string}
export interface Notification {id:string;message:string;read_at:string|null}
export interface State {accounts:Account[];categories:Category[];transactions:Transaction[];cards:CreditCard[];purchases:Purchase[];installments:Installment[];invoice_payments:Payment[];budgets:Budget[];goals:Goal[];contributions:Contribution[];subscriptions:Subscription[];assets:Valuation[];liabilities:Valuation[];valuation_history:ValuationHistory[];notifications:Notification[];preferences:{onboarding_step:number;currency:string;timezone:string}}
export class ApiError extends Error {status:number;constructor(message:string,status:number){super(message);this.status=status;}}
export async function request<T>(path:string,body?:unknown):Promise<T>{
  let response:Response;try{response=await fetch(`/api${path}`,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json','X-Moneta-Request':'1'},body:body===undefined?undefined:JSON.stringify(body)});}catch{throw new ApiError('Não foi possível conectar ao servidor. Verifique se o iniciador do MONETA continua aberto.',0);}
  const payload=await response.json().catch(()=>({error:'Resposta inválida do servidor.'})) as T & {error?:string};
  if(!response.ok)throw new ApiError(payload.error||'Não foi possível concluir.',response.status);return payload;
}
export const mutate=(action:string,data:Record<string,unknown>,key:string=crypto.randomUUID())=>request<Record<string,unknown>>('/mutate',{action,data,key});
