import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import SeekerSignup from "./pages/SeekerSignup"
import CompanySignup from "./pages/CompanySignup"
import './App.css'

function App() {
  return (
   <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/seeker" element={<SeekerSignup />} />
      <Route path="/signup/company" element={<CompanySignup />} />
    </Routes>
  )
}

export default App