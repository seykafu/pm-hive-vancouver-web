import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { ExternalLink, FileText, Users, BookOpen, Calendar, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BackgroundOrbs from '@/components/animations/BackgroundOrbs'
import ScrollReveal from '@/components/animations/ScrollReveal'
import FloatingElement from '@/components/animations/FloatingElement'
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer'

const categories = [
  { icon: <Users className="h-6 w-6 text-[#000131]" />, title: "Past PM Presentations", desc: "Access slides and materials from previous PM Hive events and presentations." },
  { icon: <BookOpen className="h-6 w-6 text-[#000131]" />, title: "Product Books", desc: "Curated reading lists and book recommendations for product managers." },
  { icon: <Award className="h-6 w-6 text-[#000131]" />, title: "Homework Assignments", desc: "Practice exercises and assignments from past PM Hive workshops." },
  { icon: <FileText className="h-6 w-6 text-[#000131]" />, title: "Estimation Fact Sheet", desc: "Comprehensive guide to product estimation techniques and best practices." },
  { icon: <Calendar className="h-6 w-6 text-[#000131]" />, title: "Technical Interview Questions", desc: "Common technical interview questions and preparation materials for PM roles." },
  { icon: <Users className="h-6 w-6 text-[#000131]" />, title: "Community Resources", desc: "Additional materials and resources shared by the PM Hive community." },
]

const Resources = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/signin')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000131] via-[#000131] to-[#1a1f3a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000131] via-[#000131] to-[#1a1f3a] relative">
      <BackgroundOrbs variant="hero" />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 relative z-10">
        <div className="space-y-8">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center">
              <Badge variant="secondary" className="text-sm px-4 py-2 bg-white/10 text-white border-white/20 mb-4">
                Exclusive Member Resources
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                PM Hive{" "}
                <span className="text-gold-gradient">Resource Library</span>
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Access our curated collection of product management resources, presentations, and learning materials.
              </p>
            </div>
          </ScrollReveal>

          {/* Main Resource Link */}
          <ScrollReveal delay={0.1}>
            <Card className="bg-white/10 border-[#d4af37]/20 backdrop-blur-sm animate-pulse-glow">
              <CardHeader className="text-center">
                <FloatingElement distance={8} duration={3}>
                  <div className="w-16 h-16 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-[#000131]" />
                  </div>
                </FloatingElement>
                <CardTitle className="text-2xl font-bold text-white">
                  PM Hive Resource Repository
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Access our comprehensive collection of PM resources, presentations, and materials
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400 }}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#000131] px-8 py-3 text-lg font-semibold rounded-full"
                    asChild
                  >
                    <a
                      href="https://drive.google.com/drive/folders/10RHLsxs9n17Uc36QHf5gg_BPAARnunuC?usp=drive_link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-5 w-5" />
                      Access Resources
                    </a>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Resource Categories */}
          <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <StaggerItem key={cat.title}>
                <Card className="bg-white/10 border-[#d4af37]/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <FloatingElement distance={6} duration={3 + i * 0.5}>
                      <div className="w-12 h-12 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center mb-4">
                        {cat.icon}
                      </div>
                    </FloatingElement>
                    <h3 className="text-xl font-semibold text-white mb-2">{cat.title}</h3>
                    <p className="text-gray-300">{cat.desc}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Additional Info */}
          <ScrollReveal>
            <Card className="bg-white/10 border-[#d4af37]/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-4">Need Help?</h3>
                <p className="text-gray-300 mb-4">
                  If you have trouble accessing any resources or would like to contribute materials,
                  please reach out to us through our Discord or WhatsApp channels.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    className="border-[#7289da] text-[#7289da] bg-transparent hover:bg-[#7289da] hover:text-white"
                    asChild
                  >
                    <a href="https://discord.gg/PJePVzzHxS" target="_blank" rel="noopener noreferrer">
                      Join Discord
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#25d366] text-[#25d366] bg-transparent hover:bg-[#25d366] hover:text-white"
                    asChild
                  >
                    <a href="https://chat.whatsapp.com/HIYeA3kAxnK95kfaJQPqnz" target="_blank" rel="noopener noreferrer">
                      Join WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Resources
