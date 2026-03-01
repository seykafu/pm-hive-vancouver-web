import { useRef, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Users, Linkedin, Youtube, MessageCircle, Mic } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import { motion, useInView } from "framer-motion";
import BackgroundOrbs from "@/components/animations/BackgroundOrbs";
import ScrollReveal from "@/components/animations/ScrollReveal";
import FloatingElement from "@/components/animations/FloatingElement";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = target / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const socialTiles = [
  { href: "https://www.linkedin.com/company/pmhivevan/", icon: <Linkedin className="h-6 w-6" />, label: "LinkedIn", color: "bg-[#0077b5]", offset: 0 },
  { href: "https://www.youtube.com/@PMHive", icon: <Youtube className="h-6 w-6" />, label: "YouTube", color: "bg-[#FF0000]", offset: 20 },
  { href: "https://open.spotify.com/show/0P6KLUdGR28tmOI7UlqF7p?si=3a39fa464c4045a9", icon: <Mic className="h-6 w-6" />, label: "PM Hive Podcast", color: "bg-[#1DB954]", offset: -10 },
  { href: "https://discord.gg/PJePVzzHxS", icon: <MessageCircle className="h-6 w-6" />, label: "Join Discord", color: "bg-[#7289DA]", offset: 15 },
  { href: "https://chat.whatsapp.com/HIYeA3kAxnK95kfaJQPqnz", icon: <MessageCircle className="h-6 w-6" />, label: "Join WhatsApp", color: "bg-[#25D366]", offset: -5 },
];

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#000131] via-[#000131] to-[#1a1f3a] text-white">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <BackgroundOrbs variant="hero" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
              <div className="text-center md:text-left">
                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Welcome to <span className="text-gold-gradient">PM Hive</span>
                </motion.h1>
                <motion.div
                  className="h-24 md:h-20 lg:h-28"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <TypeAnimation
                    sequence={[
                      "Vancouver's best product management community that hosts socials, conferences, and workshops to grow the careers of PMs across the city.",
                      1000,
                      "We also focus on special events for senior PMs to grow connections and share domains of expertise and knowledge.",
                      1000,
                    ]}
                    wrapper="p"
                    speed={50}
                    className="text-lg md:text-xl text-gray-300 mb-8"
                    repeat={Infinity}
                  />
                </motion.div>
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400 }}>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#000131] border-0 rounded-full font-semibold"
                      asChild
                    >
                      <a href="https://lu.ma/pmhive" target="_blank" rel="noopener noreferrer">
                        <Calendar className="mr-2 h-5 w-5" />
                        Join Our Events
                      </a>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400 }}>
                    <Button size="lg" variant="outline" className="border-[#d4af37] text-[#d4af37] bg-transparent hover:bg-[#d4af37] hover:text-[#000131] rounded-full" asChild>
                      <Link to="/about">
                        <Users className="mr-2 h-5 w-5" />
                        Learn More
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
              <FloatingElement distance={16} duration={5} className="hidden md:block">
                <img
                  src="/pmhive.jpg"
                  alt="PM Hive Community Event"
                  className="rounded-2xl shadow-2xl shadow-[#d4af37]/20"
                />
              </FloatingElement>
            </div>
          </div>
        </section>

        {/* Event Impact Section */}
        <section className="py-16 relative overflow-hidden">
          <BackgroundOrbs variant="section" />
          <div className="container mx-auto px-6 relative z-10">
            <ScrollReveal>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Event Impact</h2>
                  <p className="text-gray-200">Our community's growth through meaningful connections</p>
                </div>

                <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StaggerItem className="md:col-span-2 bg-white/5 rounded-xl p-6 text-center">
                    <div className="text-4xl md:text-5xl font-bold text-[#d4af37] mb-2">
                      <AnimatedCounter target={35} suffix="+" />
                    </div>
                    <div className="text-gray-200">Total Events</div>
                  </StaggerItem>
                  <StaggerItem className="bg-white/5 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-[#f4d03f] mb-2">
                      <AnimatedCounter target={1700} suffix="+" />
                    </div>
                    <div className="text-gray-200">Total Attendees</div>
                  </StaggerItem>
                  <StaggerItem className="bg-white/5 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-[#d4af37] mb-2">
                      <AnimatedCounter target={20} suffix="+" />
                    </div>
                    <div className="text-gray-200">Monthly Socials</div>
                  </StaggerItem>
                </StaggerContainer>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Connect With Us Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <ScrollReveal direction="left">
                <h2 className="text-3xl font-bold mb-4">Connect With Us</h2>
                <p className="text-gray-400 mb-4 text-lg">
                  Follow our journey and stay updated with our latest content. Join our growing community across platforms.
                </p>
              </ScrollReveal>

              <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {socialTiles.map((tile) => (
                  <StaggerItem key={tile.label}>
                    <motion.a
                      href={tile.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${tile.color} rounded-xl p-5 flex items-center gap-3 text-white font-medium shadow-lg`}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      style={{ marginTop: tile.offset }}
                    >
                      {tile.icon}
                      {tile.label}
                    </motion.a>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
