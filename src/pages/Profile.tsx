import React, { useState, useRef } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Camera, Upload, User, Edit, Save, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const profileSchema = z.object({
  current_position: z.string().min(1, 'Current position is required'),
  linkedin_profile: z.string().url('Please enter a valid LinkedIn URL'),
  specialization: z.string().min(1, 'Specialization is required'),
  looking_for: z.enum(['Mentorship', 'Help Mentor', 'Learn']),
})

type ProfileForm = z.infer<typeof profileSchema>

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, profile, updateProfile, uploadProfilePicture, signOut, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      current_position: profile?.current_position || '',
      linkedin_profile: profile?.linkedin_profile || '',
      specialization: profile?.specialization || '',
      looking_for: profile?.looking_for || 'Learn',
    },
  })

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      form.reset({
        current_position: profile.current_position,
        linkedin_profile: profile.linkedin_profile,
        specialization: profile.specialization,
        looking_for: profile.looking_for,
      })
    }
  }, [profile, form])

  // Handle navigation when user is not authenticated
  React.useEffect(() => {
    // Only redirect if we're sure the user is not authenticated (not during loading)
    if (!authLoading && user === null) {
      navigate('/signin')
    }
  }, [user, authLoading, navigate])

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true)
    
    // Increase timeout to 15 seconds to give more time for the operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000)
    })
    
    try {
      const updatePromise = updateProfile(data)
      const result = await Promise.race([updatePromise, timeoutPromise]) as { error?: any }
      
      if (result.error) {
        console.error('Profile update error in Profile component:', result.error)
        toast({
          title: "Error updating profile",
          description: result.error.message || "An unknown error occurred. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Profile updated!",
          description: "Your profile has been successfully updated.",
        })
        setIsEditing(false) // Exit edit mode after successful save
      }
    } catch (timeoutError) {
      console.error('Profile update timeout:', timeoutError)
      toast({
        title: "Update timeout",
        description: "The request took too long. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)
    const { error, url } = await uploadProfilePicture(file)
    
    if (error) {
      console.error('Upload error in Profile component:', error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } else if (url) {
      await updateProfile({ profile_picture_url: url })
      toast({
        title: "Image uploaded!",
        description: "Your profile picture has been updated.",
      })
    }
    
    setUploadingImage(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    })
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form to current profile data
    if (profile) {
      form.reset({
        current_position: profile.current_position,
        linkedin_profile: profile.linkedin_profile,
        specialization: profile.specialization,
        looking_for: profile.looking_for,
      })
    }
  }

  // Show loading state while authentication is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000131] via-[#000131] to-[#1a1f3a] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null
  }

  console.log('Profile component: rendering profile page for user:', user.email)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000131] via-[#000131] to-[#1a1f3a]">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Your Profile</h1>
            <p className="text-gray-300">Manage your PM Hive profile and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <Card className="bg-white/10 border-[#d4af37]/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Profile Picture</CardTitle>
                <CardDescription className="text-gray-300">
                  Upload a professional photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Avatar className="w-32 h-32 border-4 border-[#d4af37]/30">
                    <AvatarImage 
                      src={profile?.profile_picture_url} 
                      alt="Profile picture"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#000131] text-2xl">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full border-[#d4af37] text-[#d4af37] bg-transparent hover:bg-[#d4af37] hover:text-[#000131]"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      'Uploading...'
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    {user.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card className="bg-white/10 border-[#d4af37]/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Profile Information</CardTitle>
                    <CardDescription className="text-gray-300">
                      {isEditing ? 'Edit your professional information' : 'Your professional information'}
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      onClick={handleEdit}
                      variant="outline"
                      className="border-[#d4af37] text-[#d4af37] bg-transparent hover:bg-[#d4af37] hover:text-[#000131]"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_position" className="text-white">Current Position</Label>
                        <Input
                          id="current_position"
                          {...form.register('current_position')}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="e.g., Senior Product Manager"
                        />
                        {form.formState.errors.current_position && (
                          <p className="text-red-400 text-sm">{form.formState.errors.current_position.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin_profile" className="text-white">LinkedIn Profile</Label>
                        <Input
                          id="linkedin_profile"
                          {...form.register('linkedin_profile')}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                        {form.formState.errors.linkedin_profile && (
                          <p className="text-red-400 text-sm">{form.formState.errors.linkedin_profile.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specialization" className="text-white">What do you specialize in?</Label>
                        <Textarea
                          id="specialization"
                          {...form.register('specialization')}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                          placeholder="e.g., B2B SaaS, Mobile apps, AI/ML products..."
                          rows={3}
                        />
                        {form.formState.errors.specialization && (
                          <p className="text-red-400 text-sm">{form.formState.errors.specialization.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="looking_for" className="text-white">What are you looking for?</Label>
                        <Select onValueChange={(value) => form.setValue('looking_for', value as any)}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select your goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mentorship">Mentorship</SelectItem>
                            <SelectItem value="Help Mentor">Help Mentor</SelectItem>
                            <SelectItem value="Learn">Learn</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.looking_for && (
                          <p className="text-red-400 text-sm">{form.formState.errors.looking_for.message}</p>
                        )}
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#000131] font-semibold"
                          disabled={loading}
                        >
                          {loading ? (
                            'Saving...'
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <Label className="text-white font-semibold">Current Position</Label>
                        <p className="text-gray-300 mt-1">{profile?.current_position || 'Not specified'}</p>
                      </div>

                      <div>
                        <Label className="text-white font-semibold">LinkedIn Profile</Label>
                        {profile?.linkedin_profile ? (
                          <a 
                            href={profile.linkedin_profile} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#d4af37] hover:text-[#f4d03f] underline mt-1 block"
                          >
                            {profile.linkedin_profile}
                          </a>
                        ) : (
                          <p className="text-gray-300 mt-1">Not specified</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-white font-semibold">Specialization</Label>
                        <p className="text-gray-300 mt-1">{profile?.specialization || 'Not specified'}</p>
                      </div>

                      <div>
                        <Label className="text-white font-semibold">Looking For</Label>
                        <p className="text-gray-300 mt-1">{profile?.looking_for || 'Not specified'}</p>
                      </div>

                      <div className="pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSignOut}
                          className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default Profile 