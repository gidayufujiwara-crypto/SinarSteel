import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router'
import UpdateNotifier from './components/UpdateNotifier'

function App() {
  return (
    <BrowserRouter>
      <UpdateNotifier />
      <AppRouter />
    </BrowserRouter>
  )
}

export default App