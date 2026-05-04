import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import SeekerSignup from "./pages/SeekerSignup"
import CompanySignup from "./pages/CompanySignup"
import Home from "./pages/Home"
import PendingApproval from "./pages/PendingApproval"
import CompanyDashboard from "./pages/company/CompanyDashboard"
import './App.css'

function App() {
  return (
   <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/seeker" element={<SeekerSignup />} />
      <Route path="/signup/company" element={<CompanySignup />} />
      <Route path="/pending" element={<PendingApproval />} />
      <Route path="/" element={<Home />} />
      <Route path="/company/dashboard" element={<CompanyDashboard />} />
    </Routes>
  )
}

export default App