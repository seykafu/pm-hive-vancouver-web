import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundOrbs from "@/components/animations/BackgroundOrbs";
import ScrollReveal from "@/components/animations/ScrollReveal";

const galleryItems = [
  // Monthly Socials
  { title: "PM Hive Social #1", type: "Monthly Social", date: "Dec 2023", image: "/assets/de6f8643-3d83-4288-8bcd-77951f812d2b.png" },
  { title: "PM Hive Social #2", type: "Monthly Social", date: "Dec 2023", image: "/assets/2809ac9c-a656-4133-8801-6bd5c7b5dcbc.png" },
  { title: "PM Hive Social #3", type: "Monthly Social", date: "Jan 2024", image: "/assets/b554fc99-4d56-44d2-be11-b8cd20095abe.png" },
  { title: "PM Hive Social #4", type: "Monthly Social", date: "Jan 2024", image: "/assets/04df30d5-b36f-40ae-a55b-6ee0a296a460.png" },
  { title: "PM Hive Social #5", type: "Monthly Social", date: "Jan 2024", image: "/assets/d89e24b5-adb6-41b4-902b-633e251ede44.png" },
  { title: "PM Hive Social #6", type: "Monthly Social", date: "Feb 2024", image: "/assets/446e5b44-ad98-47ab-9867-da430835dbbf.png" },
  { title: "PM Hive Social #7", type: "Monthly Social", date: "Feb 2024", image: "/assets/6a6b416c-f96c-47d7-b8a3-ac932c236273.png" },
  { title: "PM Hive Social #8", type: "Monthly Social", date: "Mar 2024", image: "/assets/b9ae0d14-916a-4eba-bb8a-98c278ced0c7.png" },
  { title: "PM Hive Social #9", type: "Monthly Social", date: "Mar 2024", image: "/assets/52b07fa4-57a3-488a-8c1c-4bf231cbec4b.png" },
  { title: "PM Hive Social #10", type: "Monthly Social", date: "May 2024", image: "/assets/51fc85eb-c141-407f-bb40-b8d2d9f65af6.png" },
  { title: "PM Hive Social #11", type: "Monthly Social", date: "Jun 2024", image: "/assets/691f28e2-2834-4bda-8955-e6c2710f1a86.png" },
  { title: "PM Hive Social #12", type: "Monthly Social", date: "Aug 2024", image: "/assets/8e395b8c-6950-4abb-ab4a-855102330ef1.png" },
  { title: "PM Hive Social #13", type: "Monthly Social", date: "Sep 2024", image: "/assets/f4f0e318-1418-4189-bcdf-1f060c931b37.png" },
  { title: "PM Hive Social #14", type: "Monthly Social", date: "Oct 2024", image: "/assets/de7384cb-6893-426e-953e-f00dbfe897c8.png" },
  { title: "PM Hive Social #15", type: "Monthly Social", date: "Nov 2024", image: "/assets/c6b0c2a0-4a8b-494b-bf2f-9f7b1e8a9f0e.png" },
  { title: "PM Hive Social #16", type: "Monthly Social", date: "Dec 2024", image: "/assets/06d32cd1-72c1-452c-b772-4e1fdbfc55fd.png" },
  { title: "PM Hive Social #17", type: "Monthly Social", date: "Jan 2025", image: "/assets/1421192c-1c37-4ad8-96ec-0932dc523509.png" },
  { title: "PM Hive Social #18", type: "Monthly Social", date: "Feb 2025", image: "/assets/9ace5c20-01ab-4717-ae26-d89a51ecd9d6.png" },
  { title: "PM Hive Social #19", type: "Monthly Social", date: "Mar 2025", image: "/assets/abe898f6-cc2b-411e-b60d-a1f9249d0806.png" },
  { title: "PM Hive Social #20", type: "Monthly Social", date: "Apr 2025", image: "/assets/725cde65-7b4d-4101-81dc-b0f955e53491.png" },
  // Educational Talks
  { title: "PM Buzz 1.0: AI Product Management Fundamentals", type: "Educational Talk", date: "Mar 2024", image: "/assets/fb577262-07e8-46a1-bc0e-9f3074082362.png" },
  { title: "PM Buzz 2.0: Differences between Project, Program, and Product", type: "Educational Talk", date: "Jun 2024", image: "/assets/3c7026b0-d74c-41e2-908b-cd22e8fe9de0.png" },
  { title: "PM Buzz 3.0: Non-traditional backgrounds in PM", type: "Educational Talk", date: "Sep 2024", image: "/assets/3e05f0e9-8fc8-4140-a971-aef3c30c9627.png" },
  { title: "PM Buzz 4.0: Imposter Syndrome Night", type: "Educational Talk", date: "Dec 2024", image: "/assets/3c65baaf-2c90-463d-99ba-3f65c4ab8a6a.png" },
  // Collaborative Workshops
  { title: "PM Hive x Vancouver Design Community (VDC) Workshop #1", type: "Collaborative Workshop", date: "Aug 2024", image: "/assets/7683444b-f43f-4d0d-8a16-20c4a4c2e669.png" },
  { title: "Vancouver Tech Week PM Hive x VDC Panel Discussion", type: "Panel Discussion", date: "Oct 2024", image: "/assets/eec65660-829a-413f-9423-ef13e208b9a4.png" },
  { title: "PM Hive x Vancouver.Dev Dinner Social #1", type: "Dinner Social", date: "Apr 2024", image: "/assets/7e887125-b9c2-4d07-af67-fc6ddeb3c757.png" },
];

const eventTypes = ["All", "Monthly Social", "Educational Talk", "Collaborative Workshop", "Panel Discussion", "Dinner Social"];

const getEventTypeColor = (type: string) => {
  switch (type) {
    case "Monthly Social":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "Educational Talk":
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    case "Collaborative Workshop":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "Panel Discussion":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "Dinner Social":
      return "bg-pink-500/20 text-pink-300 border-pink-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All" ? galleryItems : galleryItems.filter((e) => e.type === activeFilter);

  return (
    <div className="min-h-screen bg-[#000131] relative">
      <BackgroundOrbs variant="section" />
      <Navbar />

      <div className="pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Event{" "}
                <span className="text-gold-gradient">Gallery</span>
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Explore our journey through 40+ amazing events that have brought Vancouver's PM community together.
              </p>
            </div>
          </ScrollReveal>

          {/* Filter Bar */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeFilter === type
                    ? "text-[#000131]"
                    : "text-gray-300 hover:text-white bg-white/5"
                }`}
              >
                {activeFilter === type && (
                  <motion.div
                    layoutId="filter-pill"
                    className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{type}</span>
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((event, index) => {
                const isFeatured = index % 7 === 0 && index > 0;
                const isWide = !isFeatured && index % 5 === 0 && index > 0;

                return (
                  <motion.div
                    key={event.title}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className={`${isFeatured ? "md:col-span-2 md:row-span-2" : isWide ? "md:col-span-2" : ""}`}
                  >
                    <motion.div
                      whileHover={{ y: -8 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors duration-300 group overflow-hidden h-full">
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          {/* Overlay slide-up on hover */}
                          <div className="absolute inset-0 bg-[#d4af37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Badge className={`absolute top-4 left-4 ${getEventTypeColor(event.type)} border`}>
                            {event.type}
                          </Badge>
                        </div>

                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                            {event.title}
                          </h3>
                          <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{event.date}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Gallery;
