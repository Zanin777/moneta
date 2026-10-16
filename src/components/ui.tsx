import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { X, LoaderCircle } from 'lucide-react';
export function Button({ variant = 'primary', loading = false, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; loading?: boolean }) {
  return <button {...props} className={`button ${variant} ${props.className ?? ''}`} disabled={props.disabled || loading} aria-busy={loading || undefined}>{loading && <LoaderCircle size={16} className="spin" aria-hidden="true"/>}{children}</button>;
}
export function Card({children, className = ''}: {children:ReactNode; className?:string}) { return <section className={`card ${className}`}>{children}</section>; }
export function Badge({children, tone = 'neutral'}: {children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'primary'}) { return <span className={`badge ${tone}`}>{children}</span>; }
export function Field({label, error, hint, ...props}: InputHTMLAttributes<HTMLInputElement> & {label:string; error?:string; hint?:string}) {
  const id = useId(); return <div className="field"><label htmlFor={id}>{label}</label><input {...props} id={id} aria-invalid={!!error} aria-describedby={error || hint ? `${id}-help` : undefined}/>{(error || hint) && <small id={`${id}-help`} className={error ? 'error-text' : ''}>{error || hint}</small>}</div>;
}
export function Progress({value, label, tone = 'primary'}: {value:number; label:string; tone?:'primary'|'success'|'warning'|'danger'}) {
  const safe = Math.max(0,Math.min(100,value)); return <div className={`progress ${tone}`} role="progressbar" aria-label={label} aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${safe}%`}}/></div>;
}
export function Modal({open, onClose, title, children}: {open:boolean; onClose:()=>void; title:string; children:ReactNode}) {
  const dialog = useRef<HTMLDialogElement>(null); const titleId = useId();
  useEffect(() => { if (open && !dialog.current?.open) dialog.current?.showModal(); else if (!open && dialog.current?.open) dialog.current.close(); }, [open]);
  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={onClose} onClose={onClose} onClick={e => { if(e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}><div className="dialog-heading"><h2 id={titleId}>{title}</h2><Button variant="ghost" onClick={onClose} aria-label="Fechar janela"><X size={20}/></Button></div>{children}</dialog>;
}
