import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

const ConnectionTest = () => {
  const [testResult, setTestResult] = useState<string>('')
  const [isTesting, setIsTesting] = useState(false)

  const runConnectionTest = async () => {
    setIsTesting(true)
    setTestResult('Testing connection...')
    
    try {
      const startTime = Date.now()
      
      // Test 1: Simple query to check connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      if (error) {
        setTestResult(`❌ Connection failed: ${error.message} (${responseTime}ms)`)
      } else {
        setTestResult(`✅ Connection successful! Response time: ${responseTime}ms`)
      }
    } catch (err) {
      setTestResult(`❌ Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-500 text-white p-4 rounded-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Connection Test</h3>
      <Button
        onClick={runConnectionTest}
        disabled={isTesting}
        size="sm"
        className="mb-2"
      >
        {isTesting ? 'Testing...' : 'Test Connection'}
      </Button>
      {testResult && (
        <p className="text-xs">{testResult}</p>
      )}
    </div>
  )
}

export default ConnectionTest 