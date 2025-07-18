
import './App.css'
import { Routes, Route } from "react-router-dom"
import LandingScreen from "@/screens/LandingScreen"
import { AppShell } from './components/layout/AppShell'

function App() {

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<LandingScreen />} />
        {/* Add more screens here */}
      </Route>
    </Routes>
  )
}

export default App
