import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const EyeOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [logoError, setLogoError] = useState(false)

  function handleLogin() {
    setError('')
    const ok = login(email, password)
    if (!ok) {
      setError('Email hoặc mật khẩu không đúng.')
      setPassword('')
      setShowPass(false)
    } else {
      navigate('/', { replace: true })
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #EBF4FD 0%, #F2F6FA 50%, #F3EFFE 100%)' }}
    >
      <div
        className="bg-white w-full max-w-[420px] p-10"
        style={{ borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,.12)' }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          {!logoError ? (
            <img
              src="https://cloud-edr.cmcuat.cloud/public/img/logo_CMC_CS.svg"
              alt="CMC Cyber Security"
              className="h-14 w-auto block mx-auto mb-4"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div
              className="w-[52px] h-[52px] flex items-center justify-center mx-auto mb-4 rounded-xl text-white font-bold text-lg"
              style={{ background: '#0268C5' }}
            >
              CM
            </div>
          )}
          <h1 className="text-[22px] font-bold mb-1.5" style={{ color: '#1F2533' }}>
            Chào mừng đến OneCRM
          </h1>
          <p className="text-[13px]" style={{ color: '#636363' }}>
            Nền tảng quản lý khách hàng · CMC Cyber Security
          </p>
        </div>

        <div className="h-px mb-6" style={{ background: '#E5E5E5' }} />

        {/* Email */}
        <div className="flex flex-col gap-1.5 mb-3.5">
          <label className="text-[13px] font-medium" style={{ color: '#111827' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập email của bạn"
            className="w-full px-3 py-2.5 text-[14px] rounded-lg border outline-none transition-all"
            style={{
              borderColor: '#E5E5E5',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0268C5'
              e.target.style.boxShadow = '0 0 0 3px rgba(2,104,197,.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E5E5'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5 mb-2.5">
          <label className="text-[13px] font-medium" style={{ color: '#111827' }}>
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập mật khẩu"
              className="w-full px-3 py-2.5 pr-11 text-[14px] rounded-lg border outline-none transition-all"
              style={{
                borderColor: '#E5E5E5',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0268C5'
                e.target.style.boxShadow = '0 0 0 3px rgba(2,104,197,.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E5E5'
                e.target.style.boxShadow = 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center p-0 bg-transparent border-none cursor-pointer"
              style={{ color: '#9CA3AF' }}
            >
              {showPass ? <EyeOffIcon /> : <EyeOpenIcon />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="text-[12px] px-3 py-2 rounded-md mb-3 border"
            style={{ color: '#FB2C36', background: '#FEF2F2', borderColor: '#FECACA' }}
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleLogin}
          className="w-full py-2.5 rounded-lg text-[14px] font-semibold text-white transition-colors mt-1"
          style={{ background: '#0268C5' }}
          onMouseEnter={(e) => (e.target.style.background = '#0257A8')}
          onMouseLeave={(e) => (e.target.style.background = '#0268C5')}
        >
          Đăng nhập
        </button>

        {/* Hint */}
        <p className="text-center text-[11px] mt-4" style={{ color: '#9CA3AF' }}>
          Demo: <span className="font-medium">sales.a@cmc.vn</span> / <span className="font-medium">demo123</span>
        </p>
      </div>
    </div>
  )
}
