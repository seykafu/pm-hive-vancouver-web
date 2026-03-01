import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SupabaseDiagnostics = () => {
  const [results, setResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const { user } = useAuth()

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Helper function to add timeout to any promise
  const withTimeout = (promise: Promise<any>, timeoutMs: number = 5000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])
    
    try {
      addResult('Starting Supabase diagnostics...')
      
      // Test 1: Check environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        addResult('❌ Environment variables missing')
        return
      }
      addResult('✅ Environment variables present')
      addResult(`URL: ${supabaseUrl.substring(0, 30)}...`)
      
      // Test 2: Check Supabase client
      if (!supabase) {
        addResult('❌ Supabase client not initialized')
        return
      }
      addResult('✅ Supabase client initialized')
      
      // Test 3: Test basic connection with timeout
      addResult('Testing basic connection (5s timeout)...')
      try {
        const { data, error } = await withTimeout(
          supabase.from('profiles').select('count').limit(1),
          5000
        )
        
        if (error) {
          addResult(`❌ Connection failed: ${error.message}`)
          return
        }
        addResult('✅ Basic connection successful')
      } catch (timeoutError) {
        addResult(`❌ Connection timeout: ${timeoutError instanceof Error ? timeoutError.message : 'Unknown error'}`)
        addResult('💡 This suggests your Supabase project might be paused')
        return
      }
      
      // Test 4: Check if user is authenticated
      if (!user) {
        addResult('⚠️ No authenticated user')
        return
      }
      addResult(`✅ User authenticated: ${user.id}`)
      
      // Test 5: Test profile read with timeout
      addResult('Testing profile read (5s timeout)...')
      try {
        const { data: profileData, error: profileError } = await withTimeout(
          supabase.from('profiles').select('*').eq('user_id', user.id).single(),
          5000
        )
        
        if (profileError) {
          addResult(`❌ Profile read failed: ${profileError.message}`)
        } else {
          addResult('✅ Profile read successful')
        }
      } catch (timeoutError) {
        addResult(`❌ Profile read timeout: ${timeoutError instanceof Error ? timeoutError.message : 'Unknown error'}`)
      }
      
      // Test 6: Test profile write with timeout
      addResult('Testing profile write (5s timeout)...')
      try {
        const { error: writeError } = await withTimeout(
          supabase.from('profiles').upsert({
            user_id: user.id,
            current_position: 'Diagnostic Test',
            linkedin_profile: 'https://test.com',
            specialization: 'Test',
            looking_for: 'Learn',
            updated_at: new Date().toISOString(),
          }).select(),
          5000
        )
        
        if (writeError) {
          addResult(`❌ Profile write failed: ${writeError.message}`)
        } else {
          addResult('✅ Profile write successful')
        }
      } catch (timeoutError) {
        addResult(`❌ Profile write timeout: ${timeoutError instanceof Error ? timeoutError.message : 'Unknown error'}`)
      }
      
      addResult('Diagnostics complete!')
      
    } catch (err) {
      addResult(`❌ Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Card className="fixed top-20 right-4 w-96 bg-white/10 border-[#d4af37]/20 backdrop-blur-sm z-50">
      <CardHeader>
        <CardTitle className="text-white text-lg">Supabase Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#000131] font-semibold"
        >
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </Button>
        
        {results.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-1">
            {results.map((result, index) => (
              <div key={index} className="text-xs text-gray-300 font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SupabaseDiagnostics 