// Spec: context.md §5 — Ponto de entrada React (Vite)
// Renderiza a aplicação no elemento #root do index.html

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
