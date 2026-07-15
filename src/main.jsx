import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initPixel } from './analytics.js'
import './styles.css'

initPixel()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
