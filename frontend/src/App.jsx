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
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import JobDetails from "./pages/JobDetails"
import CompanyProfile from "./pages/company/CompanyProfile"
import CompanyJobs from "./pages/company/CompanyJobs"
import Companies from "./pages/Companies"
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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
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
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/company/profile" element={<CompanyProfile />} />
      <Route path="/company/jobs" element={<CompanyJobs />} />
      <Route path="/companies" element={<Companies />} />
    </Routes>
  )
}

export default App