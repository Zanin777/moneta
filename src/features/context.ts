import {createContext,useContext} from 'react';
import type {State,User} from '../services/api';
import type {FormConfig} from '../components/Forms';
export interface FinanceContext {s:State;user:User;month:string;setMonth:(v:string)=>void;open:(config:FormConfig)=>void;confirm:(title:string,help:string,action:string,data:Record<string,unknown>)=>void;run:(action:string,data:Record<string,unknown>)=>Promise<void>;notify:(text:string)=>void;navigate:(page:string)=>void}
export const Finance=createContext<FinanceContext|null>(null);
export function useFinance(){const context=useContext(Finance);if(!context)throw new Error('Finance context unavailable');return context;}
