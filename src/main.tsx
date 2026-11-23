import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createAppDependencies } from './app/bootstrap/createAppDependencies'
import { AppProviders } from './app/providers/AppProviders'
import RootErrorBoundary from './app/errors/RootErrorBoundary'
import './index.css'

const dependencies = createAppDependencies()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <AppProviders>
        <App dependencies={dependencies} />
      </AppProviders>
    </RootErrorBoundary>
  </React.StrictMode>,
)
