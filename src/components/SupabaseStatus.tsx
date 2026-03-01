import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const SupabaseStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [error, setError] = useState<string>('')
  const [details, setDetails] = useState<string>('')
  const { user } = useAuth()

  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Testing Supabase connection...')
        const startTime = Date.now()
        
        // Test 1: Basic read operation
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)

        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        if (error) {
          setStatus('error')
          setError(error.message)
          setDetails(`Read test failed after ${responseTime}ms`)
          return
        }

        // Test 2: Try to update a profile (this will help identify write issues)
        if (user) {
          console.log('Testing write operation...')
          const writeStartTime = Date.now()
          
          const { error: writeError } = await supabase
            .from('profiles')
            .upsert({
              user_id: user.id,
              current_position: 'Test Position',
              linkedin_profile: 'https://test.com',
              specialization: 'Test',
              looking_for: 'Learn',
              updated_at: new Date().toISOString(),
            })
            .select()

          const writeEndTime = Date.now()
          const writeResponseTime = writeEndTime - writeStartTime

          if (writeError) {
            setStatus('error')
            setError(writeError.message)
            setDetails(`Read: ${responseTime}ms, Write failed: ${writeError.message}`)
          } else {
            setStatus('connected')
            setDetails(`Read: ${responseTime}ms, Write: ${writeResponseTime}ms`)
          }
        } else {
          setStatus('connected')
          setDetails(`Read test passed in ${responseTime}ms (no user for write test)`)
        }
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
        setDetails('Connection test failed')
      }
    }

    checkConnection()
  }, [user])

  if (status === 'checking') {
    return (
      <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50">
        Checking Supabase connection...
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50 max-w-sm">
        <div className="font-bold">Supabase Connection Error</div>
        <div className="text-sm">{error}</div>
        <div className="text-xs mt-1">{details}</div>
        <div className="text-xs mt-1">User: {user ? user.id : 'Not logged in'}</div>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
      <div className="font-bold">Supabase Connected</div>
      <div className="text-xs">{details}</div>
      <div className="text-xs mt-1">User: {user ? user.id : 'Not logged in'}</div>
    </div>
  )
}

export default SupabaseStatus 