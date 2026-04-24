"use client";

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { StatefulButton } from "@/components/ui/stateful-button";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { Sparkles, ArrowRight } from "lucide-react";
import * as motion from "framer-motion/client";

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-blue-600">
      <DottedGlowBackground 
        className="opacity-30" 
        color="rgba(255, 255, 255, 0.1)"
        glowColor="rgba(255, 255, 255, 0.4)"
        gap={20}
        radius={1.2}
      />
      
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 mb-8"
        >
          <Sparkles className="h-4 w-4" />
          <span>Instant Onboarding</span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-bold tracking-tight text-white sm:text-7xl mb-8"
        >
          Ready to <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">transform</span> your business?
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Join hundreds of companies already using Rivexaflow to streamline operations, boost productivity, and scale faster.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <MovingBorderButton
            borderRadius="1.75rem"
            className="bg-white text-blue-600 font-bold border-transparent"
            containerClassName="h-14 w-64"
            borderClassName="bg-[radial-gradient(#ffffff_40%,transparent_60%)]"
            onClick={() => window.location.href = '/login'}
          >
            Start 14-Day Free Trial
          </MovingBorderButton>
          
          <button
            onClick={() => window.location.href = '/contact'}
            className="group flex items-center gap-2 text-lg font-bold text-white transition-all hover:text-blue-100"
          >
            Book a personalized demo <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4 border-t border-white/10 pt-12"
        >
          {[
            { label: "Active Users", value: "10K+" },
            { label: "Daily Tasks", value: "250K+" },
            { label: "Uptime SLA", value: "99.99%" },
            { label: "Customer Rating", value: "4.9/5" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-blue-100 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
