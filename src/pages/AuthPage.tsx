import { useState } from 'react'
import { LoginForm } from '../components/auth/LoginForm'
import { SignupForm } from '../components/auth/SignupForm'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
  }

  const handleForgotPassword = () => {
    // TODO: Implémenter la réinitialisation de mot de passe
    console.log('Forgot password clicked')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {mode === 'login' ? (
          <LoginForm onToggleMode={toggleMode} onForgotPassword={handleForgotPassword} />
        ) : (
          <SignupForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  )
}
