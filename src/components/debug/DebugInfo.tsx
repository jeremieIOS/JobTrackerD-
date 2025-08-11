import { useAuth } from '../../hooks/useAuth'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface DebugInfoProps {
  teamId?: string
}

export function DebugInfo({ teamId }: DebugInfoProps) {
  const { user, session, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const testSupabaseAuth = async () => {
    try {
      setTestResult('Testing...')
      
      // Test 1: Current session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session:', session)
      
      // Test 2: Direct RLS query
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .limit(1)
      
      console.log('RLS Query result:', { jobs, error })
      
      if (error) {
        setTestResult(`❌ RLS Error: ${error.message}`)
      } else {
        setTestResult(`✅ RLS Works: ${jobs?.length || 0} jobs, Session: ${session ? 'Active' : 'None'}`)
      }
    } catch (err) {
      setTestResult(`💥 Exception: ${err}`)
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  if (!mounted) {
    return null
  }



  return (
    <div className="fixed top-20 right-4 bg-red-600 text-white p-4 rounded-lg text-xs max-w-sm z-50 shadow-lg">
      <div className="font-bold mb-2">🚨 RLS DEBUG</div>
      <div><strong>Auth Loading:</strong> {loading ? '🔄 YES' : '✅ NO'}</div>
      <div><strong>User ID:</strong> {user?.id ? `${user.id.slice(0, 8)}...` : '❌ None'}</div>
      <div><strong>Email:</strong> {user?.email || '❌ None'}</div>
      <div><strong>Session:</strong> {session ? '✅ Active' : '❌ None'}</div>
      <div><strong>TeamId:</strong> {teamId || 'null'}</div>
      
      <button 
        onClick={testSupabaseAuth}
        className="bg-blue-600 px-2 py-1 rounded mt-2 text-xs w-full"
      >
        🔬 Test RLS
      </button>
      
      {testResult && (
        <div className="mt-2 p-2 bg-blue-800 rounded text-xs">
          {testResult}
        </div>
      )}
      
      <div className="mt-3 p-2 bg-red-800 rounded">
        <div className="font-bold">🎯 DIAGNOSTIC:</div>
        {loading && <div>⏳ Still loading auth...</div>}
        {!loading && !user && <div>❌ No user authenticated</div>}
        {!loading && !session && <div>❌ No session</div>}
        {user && session && <div>✅ Auth looks good!</div>}
      </div>
    </div>
  )
}
