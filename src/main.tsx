import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' 
import './index.css'

// Add "as HTMLElement" right after the getElementById
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)