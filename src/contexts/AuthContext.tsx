import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  user_id: string
  full_name?: string | null
  current_position: string
  linkedin_profile: string
  specialization: string
  looking_for: 'Mentorship' | 'Help Mentor' | 'Learn'
  profile_picture_url?: string
  created_at: string
  updated_at: string
  // Mentorship fields
  mentorship_role?: 'mentor' | 'mentee' | null
  mentorship_active?: boolean
  mentorship_goals?: string | null
  experience_years?: number | null
  mentor_capacity?: number | null
  mentorship_dismissed_at?: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{
    data: {
        user: User | null;
        session: Session | null;
    } | { user: null; session: null; };
    error: any;
  }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (profileData: Partial<Profile>, userId?: string) => Promise<{ error: any }>
  uploadProfilePicture: (file: File) => Promise<{ error?: any; url?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Reduce fallback timeout from 15s to 5s
    const fallbackTimeout = setTimeout(() => {
      console.warn('AuthContext: Fallback timeout reached, setting loading to false')
      setLoading(false)
    }, 5000) // Reduced from 15 seconds to 5 seconds
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(fallbackTimeout) // Clear the fallback timeout
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false) // Set loading to false immediately if no user
      }
    }).catch((error) => {
      console.error('AuthContext: Error getting initial session:', error)
      clearTimeout(fallbackTimeout)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      clearTimeout(fallbackTimeout) // Clear the fallback timeout
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false) // Set loading to false immediately if no user
      }
    })

    return () => {
      clearTimeout(fallbackTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      // Reduce timeout from 10s to 3s for faster failure detection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout after 3 seconds')), 3000)
      })
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (error) {
        if (error.code === 'PGRST116') {
          setProfile(null)
        } else {
          console.error('Error fetching profile:', error)
          setProfile(null)
        }
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } finally {
      setLoading(false) // Always set loading to false after profile fetch attempt
    }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (profileData: Partial<Profile>, userId?: string) => {
    const currentUserId = userId || user?.id;
    if (!currentUserId) {
      console.error('Update profile failed: No user logged in')
      return { error: new Error('No user logged in') }
    }

    const startTime = Date.now()
    
    try {
      // First, check if a profile already exists for this user
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', currentUserId)
        .single()

      let result;
      
      if (checkError && checkError.code === 'PGRST116') {
        // No profile exists, create a new one
        result = await supabase
          .from('profiles')
          .insert({
            user_id: currentUserId,
            ...profileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()
      } else if (existingProfile) {
        // Profile exists, update it
        result = await supabase
          .from('profiles')
          .update({
            ...profileData,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', currentUserId)
          .select()
          .single()
      } else {
        // Some other error occurred
        console.error('Error checking existing profile:', checkError)
        return { error: checkError }
      }

      const endTime = Date.now()
      console.log(`Profile update took ${endTime - startTime}ms`)

      if (result.error) {
        console.error('Profile update error:', result.error)
        console.error('Error details:', {
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint
        })
        return { error: result.error }
      }

      if (result.data) {
        setProfile(result.data)
      }

      return { error: null }
    } catch (err) {
      const endTime = Date.now()
      console.error(`Profile update failed after ${endTime - startTime}ms:`, err)
      return { error: err instanceof Error ? err : new Error('Unknown error') }
    }
  }

  const uploadProfilePicture = async (file: File) => {
    if (!user) {
      console.error('Upload failed: No user logged in')
      return { error: new Error('No user logged in') }
    }

    console.log('Starting upload for user:', user.id)
    console.log('File details:', { name: file.name, size: file.size, type: file.type })

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = fileName // Simplified path without nested folders

    console.log('Upload path:', filePath)

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout after 10 seconds')), 10000)
    })

    try {
      const uploadPromise = supabase.storage
        .from('avatars')
        .upload(filePath, file)

      const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]) as any

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return { error: uploadError }
      }

      console.log('Upload successful, getting public URL')

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      console.log('Public URL:', publicUrl)

      return { url: publicUrl }
    } catch (timeoutError) {
      console.error('Upload timeout:', timeoutError)
      return { error: timeoutError instanceof Error ? timeoutError : new Error('Upload timeout') }
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadProfilePicture,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 