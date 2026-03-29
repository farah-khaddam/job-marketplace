import { useState } from 'react'
import { useNavigate } from "react-router-dom"
import ar from '../locales/ar'
import en from '../locales/en'
import { FcGoogle } from "react-icons/fc"
import { FaFacebookF, FaApple } from "react-icons/fa"

function Input({ text, value, onChange, type }) {
  return (
    <input
      type={type}
      placeholder={text}
      value={value}
      onChange={onChange}
    />
  )
}

function Button({ text, onClick }) {
  return <button className="login-btn" onClick={onClick}>{text}</button>
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [language, setLanguage] = useState("ar")
  const [theme, setTheme] = useState("light") 

  const texts = language === "ar" ? ar : en

  const handleLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }), // غيرنا username لـ email
      })

      const data = await response.json()
      console.log(data)

      if (response.ok && data.key) {
        localStorage.setItem("token", data.key)
        alert("Login success 🔥")
        navigate("/")
      } else {
        // عرض أول خطأ موجود من السيرفر
        const errorMessage = data.non_field_errors
          ? data.non_field_errors[0]
          : data.detail
          ? data.detail
          : "Login failed ❌"
        alert(errorMessage)
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
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>

      <div className="login-box">
        <h1>{texts.login}</h1>

        <Input text={texts.email} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input text={texts.password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button text={texts.buttonLogin} onClick={handleLogin} />

        <div className="divider"><span>OR</span></div>

        <div className="social-buttons">
          <button className="google-btn"><FcGoogle className="icon" /></button>
          <button className="facebook-btn"><FaFacebookF className="icon" /></button>
          <button className="apple-btn"><FaApple className="icon" /></button>
        </div>

        <p className="signup-text">
          {language === "ar" ? "ليس لدي حساب؟ " : "Don't have an account? "}
          <span className="signup-link" onClick={() => navigate("/signup")}>
            {language === "ar" ? "أنشئ حساب" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  )
}