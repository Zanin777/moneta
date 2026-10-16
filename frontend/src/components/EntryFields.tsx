export function EntryFields({ month }: { month: string }) {
  return (
    <div className="grid gap-5">
      <label className="grid gap-2 text-sm font-medium">Tipo
        <select name="kind" required defaultValue="expense"><option value="expense">Despesa</option><option value="income">Receita</option></select>
      </label>
      <label className="grid gap-2 text-sm font-medium">Descrição
        <input name="description" required maxLength={120} placeholder="Ex.: compras da semana" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-2 text-sm font-medium">Valor (R$)
          <input name="value" required inputMode="decimal" maxLength={16} placeholder="0,00" aria-describedby="value-help" />
        </label>
        <label className="grid gap-2 text-sm font-medium">Data
          <input name="date" type="date" required defaultValue={`${month}-01`} min="1000-01-01" max="9999-12-31" />
        </label>
      </div>
      <p id="value-help" className="-mt-3 text-xs text-slate-500">Valor positivo, sem separador de milhar. Ex.: 1250,50.</p>
      <label className="grid gap-2 text-sm font-medium">Categoria
        <input name="category" required maxLength={120} placeholder="Ex.: alimentação, salário, moradia" list="categories" />
      </label>
      <datalist id="categories"><option>Alimentação</option><option>Salário</option><option>Moradia</option><option>Transporte</option><option>Outros</option></datalist>
    </div>
  );
}
