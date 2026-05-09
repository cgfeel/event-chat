import React from 'react'
import ReactDOM from 'react-dom/client'
import './App.css'
import IframeRouter from './routers/IframeRouter'

const rootEl = document.getElementById('root')
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <IframeRouter />
    </React.StrictMode>
  )
}
