import { motion } from "framer-motion";

interface BackgroundOrbsProps {
  variant?: "hero" | "section";
}

const heroOrbs = [
  { size: 320, color: "bg-[#d4af37]/8", x: "10%", y: "20%", duration: 18 },
  { size: 250, color: "bg-[#1a1f6a]/30", x: "70%", y: "60%", duration: 22 },
  { size: 200, color: "bg-[#d4af37]/5", x: "80%", y: "10%", duration: 15 },
];

const sectionOrbs = [
  { size: 180, color: "bg-[#d4af37]/6", x: "5%", y: "30%", duration: 20 },
  { size: 140, color: "bg-[#1a1f6a]/20", x: "85%", y: "50%", duration: 16 },
];

const BackgroundOrbs = ({ variant = "section" }: BackgroundOrbsProps) => {
  const orbs = variant === "hero" ? heroOrbs : sectionOrbs;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${orb.color} blur-3xl`}
          style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
          }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

export default BackgroundOrbs;
