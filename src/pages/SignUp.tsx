import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BackgroundOrbs from '@/components/animations/BackgroundOrbs'
import { User } from '@supabase/supabase-js'

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const profileSchema = z.object({
  current_position: z.string().min(1, 'Current position is required'),
  linkedin_profile: z.string().url('Please enter a valid LinkedIn URL'),
  specialization: z.string().min(1, 'Specialization is required'),
  looking_for: z.enum(['Mentorship', 'Help Mentor', 'Learn']),
})

type SignUpForm = z.infer<typeof signUpSchema>
type ProfileForm = z.infer<typeof profileSchema>

const SignUp = () => {
  const [step, setStep] = useState<'signup' | 'profile'>('signup')
  const [loading, setLoading] = useState(false)
  const [newlySignedUpUser, setNewlySignedUpUser] = useState<User | null>(null)
  const { signUp, updateProfile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  })

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const onSignUpSubmit = async (data: SignUpForm) => {
    setLoading(true)
    const { data: authData, error } = await signUp(data.email, data.password)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else if (authData.user) {
      setNewlySignedUpUser(authData.user)
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      })
      setStep('profile')
    }
    setLoading(false)
  }

  const onProfileSubmit = async (data: ProfileForm) => {
    if (!newlySignedUpUser) {
      toast({
        title: "Error",
        description: "No user session found. Please try signing up again.",
        variant: "destructive",
      })
      setStep('signup')
      return
    }

    setLoading(true)
    const { error } = await updateProfile(data, newlySignedUpUser.id)

    if (error) {
      toast({
        title: "Error saving profile",
        description: error.message || "An unknown error occurred. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Profile created!",
        description: "Welcome to PM Hive!",
      })
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000131] via-[#000131] to-[#1a1f3a] relative">
      <BackgroundOrbs variant="section" />
      <Navbar />

      <div className="flex items-center justify-center min-h-screen pt-16 pb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/10 border-[#d4af37]/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                {step === 'signup' ? 'Create Account' : 'Complete Your Profile'}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {step === 'signup'
                  ? 'Join the PM Hive community'
                  : 'Tell us about yourself to get started'
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === 'signup' ? (
                <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...signUpForm.register('email')}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#d4af37] focus:ring-[#d4af37]/30"
                      placeholder="Enter your email"
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-red-400 text-sm">{signUpForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...signUpForm.register('password')}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#d4af37] focus:ring-[#d4af37]/30"
                      placeholder="Enter your password"
                    />
                    {signUpForm.formState.errors.password && (
                      <p className="text-red-400 text-sm">{signUpForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...signUpForm.register('confirmPassword')}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#d4af37] focus:ring-[#d4af37]/30"
                      placeholder="Confirm your password"
                    />
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-red-400 text-sm">{signUpForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#000131] font-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_position" className="text-white">Current Position</Label>
                    <Input
                      id="current_position"
                      {...profileForm.register('current_position')}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#d4af37] focus:ring-[#d4af37]/30"
                      placeholder="e.g., Senior Product Manager"
                    />
                    {profileForm.formState.errors.current_position && (
                      <p className="text-red-400 text-sm">{profileForm.formState.errors.current_position.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin_profile" className="text-white">LinkedIn Profile</Label>
                    <Input
                      id="linkedin_profile"
                      {...profileForm.register('linkedin_profile')}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#d4af37] focus:ring-[#d4af37]/30"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    {profileForm.formState.errors.linkedin_profile && (
                      <p className="text-red-400 text-sm">{profileForm.formState.errors.linkedin_profile.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-white">What do you specialize in?</Label>
                    <Textarea
                      id="specialization"
                      {...profileForm.register('specialization')}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none focus:border-[#d4af37] focus:ring-[#d4af37]/30"
                      placeholder="e.g., B2B SaaS, Mobile apps, AI/ML products..."
                      rows={3}
                    />
                    {profileForm.formState.errors.specialization && (
                      <p className="text-red-400 text-sm">{profileForm.formState.errors.specialization.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="looking_for" className="text-white">What are you looking for?</Label>
                    <Select onValueChange={(value) => profileForm.setValue('looking_for', value as any)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mentorship">Mentorship</SelectItem>
                        <SelectItem value="Help Mentor">Help Mentor</SelectItem>
                        <SelectItem value="Learn">Learn</SelectItem>
                      </SelectContent>
                    </Select>
                    {profileForm.formState.errors.looking_for && (
                      <p className="text-red-400 text-sm">{profileForm.formState.errors.looking_for.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#000131] font-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Saving Profile...' : 'Complete Profile'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

export default SignUp
