"use client";

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { Button } from "@/components/ui/button";
import { StatefulButton } from "@/components/ui/stateful-button";
import Link from "next/link";
import { 
  Lightning01, 
  ShieldTick, 
  BarChart10, 
  Users01,
  CheckCircle,
  LayoutAlt02
} from "@untitledui/icons";
import * as motion from "framer-motion/client";

export function FeatureShowcase() {
  const features = [
    {
      icon: <Lightning01 className="h-7 w-7" />,
      title: "AI-Powered Automation",
      description: "Smart workflows that learn from your team's patterns and optimize operations automatically.",
      gradient: "from-blue-600 to-indigo-600",
      color: "blue"
    },
    {
      icon: <ShieldTick className="h-7 w-7" />,
      title: "Enterprise security",
      description: "Bank-grade encryption with granular access controls and SOC2 compliance infrastructure.",
      gradient: "from-indigo-600 to-purple-600",
      color: "indigo"
    },
    {
      icon: <BarChart10 className="h-7 w-7" />,
      title: "Live visibility",
      description: "Interactive dashboards offering real-time intelligence for every department and team lead.",
      gradient: "from-purple-600 to-pink-600",
      color: "purple"
    },
    {
      icon: <Users01 className="h-7 w-7" />,
      title: "Team collaboration",
      description: "Unified communication hub integrating chat, tasks, and documentation in one place.",
      gradient: "from-pink-600 to-rose-600",
      color: "rose"
    }
  ];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-white">
      <DottedGlowBackground 
        className="opacity-40" 
        color="rgba(0, 86, 255, 0.1)"
        glowColor="rgba(0, 86, 255, 0.6)"
        gap={35}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-base font-semibold leading-7 text-blue-600">Enterprise Ready</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Everything you need to <span className="text-gradient">scale</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
            Powerful tools designed to evolve with your business, from initial validation to global enterprise operations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl dark:bg-slate-900/50 dark:ring-white/10"
            >
              <div>
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
              
              <ul className="mt-6 space-y-2">
                {[1, 2].map((_, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span>Proprietary tech included</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button variant="outline" className="h-12 rounded-full px-8 border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
            <Link href="/login">Explore Capability Matrix <LayoutAlt02 className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
