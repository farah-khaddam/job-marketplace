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
  const [mode, setMode] = useState("login") // login أو signup

  const texts = language === "ar" ? ar : en

  const handleLogin = () => {
    console.log(email, password)
  }

  return (
    <div className={`page ${language === "ar" ? "rtl" : "ltr"} ${theme}`}>
     <button 
  className="language-switch"
  onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
>
  {language === "ar" ? "EN" : "ع"}
</button>
<button
  className="theme-switch"
  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
>
  {theme === "light" ? "Dark Mode" : "Light Mode"}
</button>
      <div className="login-box">
        <h1>{texts.login}</h1>

        <Input
          text={texts.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          text={texts.password}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button text={texts.buttonLogin} onClick={handleLogin} />
        <div className="divider">
  <span>OR</span>
</div>
    <div className="social-buttons">
  <button className="google-btn">
    <FcGoogle className="icon" />
  </button>

  <button className="facebook-btn">
    <FaFacebookF className="icon" />
  </button>

  <button className="apple-btn">
    <FaApple className="icon" />
  </button>
</div>

<p className="signup-text">
  {language === "ar" ? "ليس لدي حساب؟ " : "Don't have an account? "}
  <span className="signup-link"  onClick={() => navigate("/signup")}>{language === "ar" ? "أنشئ حساب" : "Sign up"}</span>
</p>

      </div>
      
    </div>
  )
}

