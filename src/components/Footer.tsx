import { Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";

const socialLinks = [
  { href: "https://www.linkedin.com/company/pmhivevan/", icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn" },
  { href: "https://www.youtube.com/@PMHive", icon: <Youtube className="h-4 w-4" />, label: "YouTube" },
  { href: "https://x.com/PMHiveYVR", icon: <span className="w-4 h-4 flex items-center justify-center">&#x1D54F;</span>, label: "Twitter" },
  { href: "https://discord.gg/PJePVzzHxS", icon: <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">D</span>, label: "Discord" },
];

const Footer = () => {
  return (
    <footer className="bg-[#000131]/90 backdrop-blur-sm">
      {/* Gold gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <StaggerItem className="col-span-1 md:col-span-2">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <img
                  src="/pm-hive-logo.png"
                  alt="PM Hive Logo"
                  className="w-10 h-10"
                />
                <span className="font-bold text-xl text-white">PM Hive</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed max-w-md">
                Vancouver's premier product management community, connecting PMs through socials, conferences, and workshops to grow careers across the city.
              </p>
            </div>
          </StaggerItem>

          {/* Quick Links */}
          <StaggerItem>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[#d4af37] transition-colors duration-200 text-sm gold-underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-300 hover:text-[#d4af37] transition-colors duration-200 text-sm gold-underline">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-[#d4af37] transition-colors duration-200 text-sm gold-underline">
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="https://lu.ma/pmhive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-[#d4af37] transition-colors duration-200 text-sm gold-underline"
                >
                  Events
                </a>
              </li>
            </ul>
          </StaggerItem>

          {/* Connect */}
          <StaggerItem>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="space-y-3">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-[#d4af37] transition-colors duration-200 text-sm"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </motion.a>
              ))}
            </div>
          </StaggerItem>
        </StaggerContainer>

        <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent mt-8" />
        <div className="pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2025 PM Hive. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
