import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Camera, User, Edit, Save, X, Users, GraduationCap, CheckCircle, Clock, XCircle, Linkedin } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MentorshipOptInModal from '@/components/MentorshipOptInModal'
import {
  getUserRequests,
  getProfilesByUserIds,
  endMatch,
  displayName,
} from '@/lib/mentorship'
import { emailMatchEnded } from '@/lib/email'
import type { MentorshipRequest, MentorshipProfile } from '@/types/mentorship'

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
  const [showOptIn, setShowOptIn] = useState(false)
  const [mentorshipRequests, setMentorshipRequests] = useState<{
    incoming: MentorshipRequest[]
    outgoing: MentorshipRequest[]
    active: MentorshipRequest[]
  }>({ incoming: [], outgoing: [], active: [] })
  const [relatedProfiles, setRelatedProfiles] = useState<Record<string, MentorshipProfile>>({})
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
    if (!authLoading && user === null) {
      navigate('/signin')
    }
  }, [user, authLoading, navigate])

  // Load mentorship data
  useEffect(() => {
    if (!user || !(profile as any)?.mentorship_role) return
    const load = async () => {
      const result = await getUserRequests(user.id)
      setMentorshipRequests({
        incoming: result.incoming,
        outgoing: result.outgoing,
        active: result.active,
      })
      const allReqs = [...result.incoming, ...result.outgoing, ...result.active]
      const ids = [...new Set(allReqs.flatMap(r => [r.mentee_id, r.mentor_id]))].filter(id => id !== user.id)
      if (ids.length > 0) {
        const { data: profiles } = await getProfilesByUserIds(ids)
        const map: Record<string, MentorshipProfile> = {}
        for (const p of profiles) map[p.user_id] = p
        setRelatedProfiles(map)
      }
    }
    load()
  }, [user, profile])

  const handleEndMatch = async (req: MentorshipRequest) => {
    const { error } = await endMatch(req.id)
    if (error) {
      toast({ title: 'Error', description: (error as any).message, variant: 'destructive' })
      return
    }
    const p = profile as any
    const ismentor = req.mentor_id === user?.id
    const otherId = ismentor ? req.mentee_id : req.mentor_id
    const otherProf = relatedProfiles[otherId]
    const myName = displayName(p)
    const otherName = displayName(otherProf)
    await emailMatchEnded({ recipient_user_id: user!.id, recipientName: myName, otherPartyName: otherName })
    await emailMatchEnded({ recipient_user_id: otherId, recipientName: otherName, otherPartyName: myName })
    toast({ title: 'Match ended', description: 'Both parties have been notified.' })
    const result = await getUserRequests(user!.id)
    setMentorshipRequests({ incoming: result.incoming, outgoing: result.outgoing, active: result.active })
  }

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

  const p = profile as any
  const mentorshipRole = p?.mentorship_role as 'mentor' | 'mentee' | null | undefined
  const capacity = p?.mentor_capacity ?? 2
  const activeMenteeCount = mentorshipRequests.active.filter(r => r.mentor_id === user?.id).length
  const activeMentorCount = mentorshipRequests.active.filter(r => r.mentee_id === user?.id).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000131] via-[#000131] to-[#1a1f3a]">
      <Navbar />

      <MentorshipOptInModal
        open={showOptIn}
        onClose={() => setShowOptIn(false)}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Your Profile</h1>
            <p className="text-gray-300">Manage your PM Hive profile and preferences</p>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="bg-white/5 border border-white/10 mb-6">
              <TabsTrigger value="profile" className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#000131]">
                <User className="h-4 w-4 mr-1.5" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="mentorship" className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#000131]">
                <Users className="h-4 w-4 mr-1.5" />
                Mentorship
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
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
            </TabsContent>

            {/* Mentorship Tab */}
            <TabsContent value="mentorship">
              {!mentorshipRole ? (
                <Card className="bg-white/10 border-[#d4af37]/20 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f] flex items-center justify-center mx-auto mb-4">
                      <Users className="h-7 w-7 text-[#000131]" />
                    </div>
                    <h3 className="text-white text-xl font-semibold mb-2">Join the Mentorship Program</h3>
                    <p className="text-gray-300 mb-6">Connect with PMs who can help you grow, or give back as a mentor.</p>
                    <Button
                      onClick={() => setShowOptIn(true)}
                      className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#000131] font-semibold"
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Role & status */}
                  <Card className="bg-white/10 border-[#d4af37]/20 backdrop-blur-sm">
                    <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        {mentorshipRole === 'mentor' ? (
                          <GraduationCap className="h-8 w-8 text-[#d4af37]" />
                        ) : (
                          <Users className="h-8 w-8 text-[#d4af37]" />
                        )}
                        <div>
                          <p className="text-white font-semibold capitalize">{mentorshipRole}</p>
                          <p className="text-gray-400 text-sm">
                            {mentorshipRole === 'mentor'
                              ? `${activeMenteeCount} of ${capacity} slots filled`
                              : activeMentorCount > 0
                              ? 'Matched with a mentor'
                              : 'Looking for a mentor'}
                          </p>
                        </div>
                      </div>
                      <Badge className={p?.mentorship_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-400 border-white/10'}>
                        {p?.mentorship_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Active matches */}
                  {mentorshipRequests.active.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Active Matches</h3>
                      <div className="space-y-2">
                        {mentorshipRequests.active.map(req => {
                          const otherId = req.mentor_id === user?.id ? req.mentee_id : req.mentor_id
                          const other = relatedProfiles[otherId]
                          return (
                            <Card key={req.id} className="bg-white/5 border-green-500/20">
                              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                                  <div>
                                    <p className="text-white font-medium">{displayName(other)}</p>
                                    <p className="text-gray-400 text-sm">{other?.current_position}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {other?.linkedin_profile && (
                                    <a href={other.linkedin_profile} target="_blank" rel="noopener noreferrer" className="text-[#d4af37]">
                                      <Linkedin className="h-4 w-4" />
                                    </a>
                                  )}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">
                                        End Match
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-[#000131] border-white/10">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">End this match?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400">
                                          Both you and {displayName(other)} will be notified.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="border-white/20 text-gray-300">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleEndMatch(req)} className="bg-red-600 hover:bg-red-700 text-white">
                                          End Match
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pending requests (for mentee) */}
                  {mentorshipRole === 'mentee' && mentorshipRequests.outgoing.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Pending Requests</h3>
                      <div className="space-y-2">
                        {mentorshipRequests.outgoing.map(req => {
                          const mentor = relatedProfiles[req.mentor_id]
                          return (
                            <Card key={req.id} className="bg-white/5 border-white/10">
                              <CardContent className="p-4 flex items-center gap-3">
                                {req.status === 'pending' ? (
                                  <Clock className="h-5 w-5 text-[#d4af37] flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                                )}
                                <div>
                                  <p className="text-white font-medium">{displayName(mentor)}</p>
                                  <p className="text-gray-400 text-sm">
                                    {req.status === 'pending' ? 'Awaiting response' : 'Declined'}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <Link to="/mentorship">
                    <Button variant="outline" className="w-full border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10">
                      Open Mentorship Dashboard
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Profile 