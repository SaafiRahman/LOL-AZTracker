import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {/* Cookieless, privacy-friendly page-view analytics (Vercel). */}
    <Analytics />
  </React.StrictMode>,
)
