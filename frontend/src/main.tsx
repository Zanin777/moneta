import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FinanceView } from './views/FinanceView';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Não foi possível iniciar a interface.');
createRoot(root).render(<StrictMode><FinanceView /></StrictMode>);
