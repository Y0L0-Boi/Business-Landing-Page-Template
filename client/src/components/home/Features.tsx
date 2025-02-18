import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { TrendingUp, PieChart, Users, Shield, FileText, Clock } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Portfolio Management",
    description: "Track and manage your clients' mutual fund portfolios in real-time"
  },
  {
    icon: PieChart,
    title: "Advanced Analytics",
    description: "Get detailed insights into AUM, commissions, and performance metrics"
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Efficiently manage client relationships and documents in one place"
  },
  {
    icon: Shield,
    title: "Regulatory Compliance",
    description: "Stay compliant with SEBI regulations and documentation requirements"
  },
  {
    icon: FileText,
    title: "Digital Onboarding",
    description: "Paperless client onboarding with eKYC integration"
  },
  {
    icon: Clock,
    title: "Real-time Tracking",
    description: "Monitor transactions and NAV updates in real-time"
  }
];

export default function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-black to-blue-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need to <span className="text-blue-400">Succeed</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Comprehensive tools designed specifically for mutual fund distributors
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-white/5 backdrop-blur-lg border-blue-900/50 hover:bg-white/10 transition-all duration-300">
                <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}