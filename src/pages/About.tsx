import { Card, CardContent } from "@/components/ui/card";
import { Heart, Linkedin, MessageCircle, Zap } from "lucide-react";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundOrbs from "@/components/animations/BackgroundOrbs";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";

const teamMembers = [
  {
    name: "Kasey Fu",
    role: "Captain",
    bio: "Kasey is a Senior Product Manager for Insightly CRM and Insightly AI Copilot. He's the previous product lead for Planview Copilot and started his product career at Microsoft Bing Search AI.",
    linkedin: "https://www.linkedin.com/in/kaseyfu/",
    website: "https://kaseyfu.com",
    imgSrc: "/assets/kasey.png",
  },
  {
    name: "Sarim Khawaja",
    role: "Captain",
    bio: "Sarim started his career in cybersecurity consulting at KPMG, and soon transitioned to Styx Intelligence as a cybersecurity product lead.",
    linkedin: "https://www.linkedin.com/in/sarimkhawaja/",
    imgSrc: "/assets/sarim.png",
  },
  {
    name: "Divya Rakhiani",
    role: "Captain",
    bio: "Divya has worked across multiple functions such as consulting and QA before landing as a Lead Product Manager at Quadient AP (Beanworks).",
    linkedin: "https://www.linkedin.com/in/divyarakhiani/",
    imgSrc: "/assets/divya.png",
  },
];

const values = [
  {
    icon: <Heart className="h-8 w-8 text-[#1a1f3a]" />,
    title: "Be Inclusive",
    description: "We welcome PMs at all levels and from all backgrounds to join our community. Our events are designed to be accessible to everyone.",
    align: "text-left" as const,
  },
  {
    icon: <MessageCircle className="h-8 w-8 text-[#1a1f3a]" />,
    title: "Stay Engaged",
    description: "Consistently ensuring members connect and bond is our forte. We foster meaningful relationships within our community.",
    align: "text-right" as const,
  },
  {
    icon: <Zap className="h-8 w-8 text-[#1a1f3a]" />,
    title: "Make it Deep",
    description: "We foster deep, technical conversations and themes so our senior members continue learning and growing.",
    align: "text-left" as const,
  },
];

const cardDirections: Array<"up" | "left" | "right"> = ["left", "up", "right"];
const cardOffsets = [0, 24, 0];

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#000131] via-[#000131] to-[#1a1f3a] text-white">
      <Navbar />
      <main className="flex-grow relative">
        <BackgroundOrbs variant="hero" />

        {/* Hero */}
        <section className="py-20 md:py-32 relative z-10">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <ScrollReveal direction="left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
                  About <span className="text-gold-gradient">PM Hive</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300">
                  PM Hive is Vancouver's premier hub PMs in tech, featuring over 2500 members. Our mission is to foster a community of learning, connection, and growth through socials, workshops, and our industry-leading podcast.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.15}>
                <div className="flex justify-center lg:justify-end">
                  <img
                    src="/lovable-uploads/d33c0116-03b7-451a-aeb2-771906dbab8a.png"
                    alt="PM Hive team members at Northeastern University"
                    className="rounded-2xl shadow-2xl max-w-full h-auto border-4 border-[#d4af37]/30"
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="pb-20 md:pb-32 relative z-10">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Meet the <span className="text-gold-gradient">Organizers</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, i) => (
                <ScrollReveal key={member.name} direction={cardDirections[i]} delay={i * 0.1}>
                  <div
                    className="bg-white/10 border border-[#d4af37]/20 rounded-2xl p-8 text-center hover:-translate-y-2 transition-transform duration-300"
                    style={{ marginTop: cardOffsets[i] }}
                  >
                    <motion.img
                      src={member.imgSrc}
                      alt={`Portrait of ${member.name}`}
                      className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-[#d4af37]/30"
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                    <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-[#d4af37] font-semibold mb-4">{member.role}</p>
                    <p className="text-gray-300 mb-6">{member.bio}</p>
                    <div className="flex justify-center gap-4">
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-[#d4af37] transition-colors duration-300 inline-block"
                      >
                        <Linkedin size={28} />
                      </a>
                      {member.website && (
                        <a
                          href={member.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-[#d4af37] transition-colors duration-300 inline-block"
                        >
                          <Globe size={28} />
                        </a>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="pb-20 md:pb-32 relative z-10">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Values</h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  The principles that guide everything we do in building Vancouver's PM community.
                </p>
              </div>
            </ScrollReveal>
            <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((v) => (
                <StaggerItem key={v.title}>
                  <Card className="bg-white/10 border-[#d4af37]/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                    <CardContent className={`p-8 ${v.align}`}>
                      <div className="w-16 h-16 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse-glow">
                        {v.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-4 text-center">{v.title}</h3>
                      <p className="text-gray-300">{v.description}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* How We Started */}
        <section className="pb-20 md:pb-32 relative z-10">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <Card className="bg-white/10 border-[#d4af37]/20 backdrop-blur-sm overflow-hidden">
                <div className="flex">
                  <div className="w-1 bg-gradient-to-b from-[#d4af37] to-[#f4d03f] shrink-0" />
                  <CardContent className="p-8 md:p-12">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center mr-4">
                        <Heart className="h-6 w-6 text-[#000131]" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white">How We Started</h2>
                    </div>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      PM Hive was started in late 2023 by co-founders Kasey Fu, Anthony Siu, Neda Sefati, and Tausif Shaikh, who all had the collective goal of growing a PM-based community out of Vancouver that involves inclusive networking events to support the local PM scene in building stronger connections.
                    </p>
                  </CardContent>
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
