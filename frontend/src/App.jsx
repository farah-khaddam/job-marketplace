import { Routes, Route } from "react-router-dom"
import Login from "./pages/login"
import Signup from "./pages/signup"
import SeekerSignup from "./pages/SeekerSignup"
import CompanySignup from "./pages/CompanySignup"
import OtpVerification from "./pages/OtpVerification"
import Home from "./pages/Home"
import PendingApproval from "./pages/PendingApproval"
import CompanyDashboard from "./pages/company/CompanyDashboard"
import PostJob from "./pages/company/PostJob"
import SeekerProfile from "./pages/seeker/SeekerProfile"
import JobListings from "./pages/JobListings"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import './App.css'

function App() {
    const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.dir =
      i18n.language === "ar" ? "rtl" : "ltr"
  }, [i18n.language])
  
  return (
   <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/seeker" element={<SeekerSignup />} />
      <Route path="/signup/company" element={<CompanySignup />} />
      <Route path="/otp" element={<OtpVerification />} />
      <Route path="/pending" element={<PendingApproval />} />
      <Route path="/company/pending" element={<PendingApproval />} />
      <Route path="/company/dashboard" element={<CompanyDashboard />} />
      <Route path="/company/dashboard/postJob" element={<PostJob />} />
      <Route path="/seeker/profile" element={<SeekerProfile />} />
      <Route path="/jobs" element={<JobListings />} />
    </Routes>
  )
}

export default App