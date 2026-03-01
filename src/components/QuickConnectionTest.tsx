import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

const QuickConnectionTest = () => {
  const [isTesting, setIsTesting] = useState(false)
  const [result, setResult] = useState<string>('')

  const testConnection = async () => {
    setIsTesting(true)
    setResult('Testing...')
    
    try {
      const startTime = Date.now()
      
      // Simple test query
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      if (error) {
        setResult(`❌ Failed: ${error.message} (${responseTime}ms)`)
      } else {
        setResult(`✅ Success: ${responseTime}ms`)
      }
    } catch (err) {
      setResult(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg z-50">
      <Button
        onClick={testConnection}
        disabled={isTesting}
        size="sm"
        className="mb-2"
      >
        {isTesting ? 'Testing...' : 'Quick Test'}
      </Button>
      {result && (
        <p className="text-xs">{result}</p>
      )}
    </div>
  )
}

export default QuickConnectionTest 