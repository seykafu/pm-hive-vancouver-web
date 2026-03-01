import { motion } from "framer-motion";

interface FloatingElementProps {
  children: React.ReactNode;
  distance?: number;
  duration?: number;
  className?: string;
}

const FloatingElement = ({ children, distance = 12, duration = 4, className }: FloatingElementProps) => {
  return (
    <motion.div
      animate={{ y: [-distance / 2, distance / 2, -distance / 2] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FloatingElement;
