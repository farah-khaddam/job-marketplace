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

  const handleSignup = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/registration/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email: email,
          password1: password,
          password2: confirmPassword,
          birth_date: birthDate, // مهم: يروح للباك
        }),
      })

      const data = await response.json()
      console.log(data)

      if (response.ok) {
        alert("Signup success 🔥")
        navigate("/")
      } else {
        // عرض أول خطأ من السيرفر
        const firstError = Object.values(data)[0][0]
        alert(firstError)
      }

    } catch (error) {
      console.error(error)
      alert("Error connecting to server")
    }
  }

  return (
    <div className={`page ${language === "ar" ? "rtl" : "ltr"} ${theme}`}>
      <button className="language-switch" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>
        {language === "ar" ? "EN" : "ع"}
      </button>
      <button className="theme-switch" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        {theme === "light" ? "Dark" : "Light"}
      </button>

      <div className="login-box">
        <h1>{language === "ar" ? "إنشاء حساب" : "Create Account"}</h1>

        <input placeholder={language === "ar" ? "الاسم" : "Name"} value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder={texts.email} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder={texts.password} value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder={language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />

        <button className="login-btn" onClick={handleSignup}>
          {language === "ar" ? "إنشاء حساب" : "Sign Up"}
        </button>

        <p className="signup-text">
          {language === "ar" ? "لديك حساب؟ " : "Already have an account? "}
          <span className="signup-link" onClick={() => navigate("/")}>
            {language === "ar" ? "تسجيل الدخول" : "Login"}
          </span>
        </p>
      </div>
    </div>
  )
}