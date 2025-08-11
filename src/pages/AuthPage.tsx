import { useState } from 'react'
import { LoginForm } from '../components/auth/LoginForm'
import { SignupForm } from '../components/auth/SignupForm'
import { Card } from '@/components/ui/card'

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="p-8 w-full max-w-md">
        {mode === 'login' ? (
          <LoginForm onToggleMode={toggleMode} onForgotPassword={handleForgotPassword} />
        ) : (
          <SignupForm onToggleMode={toggleMode} />
        )}
      </Card>
    </div>
  )
}
