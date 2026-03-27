import { useState } from "react"
import { useNavigate } from "react-router-dom"
import ar from "../locales/ar"
import en from "../locales/en"



export default function Signup() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [birthDate, setBirthDate] = useState("")

  const [language, setLanguage] = useState("ar")
  const [theme, setTheme] = useState("light")

  const texts = language === "ar" ? ar : en

return (
  <div className={`page ${language === "ar" ? "rtl" : "ltr"} ${theme}`}>

    {/* زر اللغة */}
    <button 
      className="language-switch"
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
    >
      {language === "ar" ? "EN" : "ع"}
    </button>

    {/* زر الثيم */}
    <button
      className="theme-switch"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? "Dark" : "Light"}
    </button>

    <div className="login-box">

      <h1>
        {language === "ar" ? "إنشاء حساب" : "Create Account"}
      </h1>

      <input
        placeholder={language === "ar" ? "الاسم" : "Name"}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder={texts.email}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder={texts.password}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder={language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <input
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
      />

      <button className="login-btn">
        {language === "ar" ? "إنشاء حساب" : "Sign Up"}
      </button>

      <p className="signup-text">
        {language === "ar" ? "لديك حساب؟ " : "Already have an account? "}
        <span 
          className="signup-link"
          onClick={() => navigate("/")}
        >
          {language === "ar" ? "تسجيل الدخول" : "Login"}
        </span>
      </p>

    </div>
  </div>
)
}