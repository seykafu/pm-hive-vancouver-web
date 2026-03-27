import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ExternalLink, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/gallery", label: "Gallery" },
  { path: "/about", label: "About Us" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#000131]/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-[#d4af37]/20"
          : "bg-[#000131]/60 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.img
              src="/pm-hive-logo.png"
              alt="PM Hive Logo"
              className="w-10 h-10"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <span className="text-white font-bold text-xl">PM Hive</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium transition-colors duration-200 py-1 ${
                  isActive(link.path) ? "text-[#d4af37]" : "text-white hover:text-[#d4af37]"
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d4af37] to-[#f4d03f]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  to="/resources"
                  className={`relative text-sm font-medium transition-colors duration-200 py-1 ${
                    isActive("/resources") ? "text-[#d4af37]" : "text-white hover:text-[#d4af37]"
                  }`}
                >
                  Resources
                  {isActive("/resources") && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d4af37] to-[#f4d03f]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
                <Link
                  to="/mentorship"
                  className={`relative text-sm font-medium transition-colors duration-200 py-1 ${
                    isActive("/mentorship") ? "text-[#d4af37]" : "text-white hover:text-[#d4af37]"
                  }`}
                >
                  Mentorship
                  {isActive("/mentorship") && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-[#d4af37] to-[#f4d03f]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              </>
            )}
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#000131] border-0 rounded-full font-semibold"
              asChild
            >
              <a href="https://lu.ma/pmhive" target="_blank" rel="noopener noreferrer">
                Events
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>

            {/* Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.profile_picture_url} alt={user.email || ""} />
                      <AvatarFallback className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#000131] text-xs">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email}</p>
                      {profile?.current_position && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {profile.current_position}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/resources" className="cursor-pointer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <span>Resources</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#d4af37] text-[#d4af37] bg-transparent hover:bg-[#d4af37] hover:text-[#000131] rounded-full"
                  asChild
                >
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#000131] border-0 rounded-full font-semibold"
                  asChild
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-[#d4af37] transition-colors duration-200"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="px-2 pt-2 pb-6 space-y-1 bg-[#000131]/95 backdrop-blur-md rounded-lg mt-2">
                <Link
                  to="/"
                  className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md ${
                    isActive("/")
                      ? "text-[#d4af37] bg-white/10"
                      : "text-white hover:text-[#d4af37] hover:bg-white/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/gallery"
                  className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md ${
                    isActive("/gallery")
                      ? "text-[#d4af37] bg-white/10"
                      : "text-white hover:text-[#d4af37] hover:bg-white/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Gallery
                </Link>
                <Link
                  to="/about"
                  className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md ${
                    isActive("/about")
                      ? "text-[#d4af37] bg-white/10"
                      : "text-white hover:text-[#d4af37] hover:bg-white/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  About Us
                </Link>
                {user && (
                  <>
                    <Link
                      to="/resources"
                      className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md ${
                        isActive("/resources")
                          ? "text-[#d4af37] bg-white/10"
                          : "text-white hover:text-[#d4af37] hover:bg-white/5"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Resources
                    </Link>
                    <Link
                      to="/mentorship"
                      className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md ${
                        isActive("/mentorship")
                          ? "text-[#d4af37] bg-white/10"
                          : "text-white hover:text-[#d4af37] hover:bg-white/5"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Mentorship
                    </Link>
                  </>
                )}
                <a
                  href="https://lu.ma/pmhive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 text-base font-medium text-white hover:text-[#d4af37] hover:bg-white/5 transition-colors duration-200 rounded-md"
                >
                  Events
                  <ExternalLink className="inline ml-1 h-4 w-4" />
                </a>

                {/* Mobile Auth */}
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-base font-medium text-white hover:text-[#d4af37] hover:bg-white/5 transition-colors duration-200 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors duration-200 rounded-md"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      className="block px-3 py-2 text-base font-medium text-white hover:text-[#d4af37] hover:bg-white/5 transition-colors duration-200 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-3 py-2 text-base font-medium text-[#d4af37] hover:text-[#f4d03f] hover:bg-white/5 transition-colors duration-200 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
