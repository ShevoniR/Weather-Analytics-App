import './App.css'
import Dashboard from './pages/Dashboard'
import Logout from './components/Logout'

function App() {
  return (
    <>
      <header style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <Logout />
      </header>
      <main>
        <Dashboard />
      </main>
    </>
  )
}

export default App
