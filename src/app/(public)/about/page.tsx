"use client";

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { Shield, Sparkles, Rocket, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900 selection:bg-blue-100 dark:bg-slate-950 dark:text-slate-50">
      <DottedGlowBackground 
        className="opacity-20" 
        color="rgba(34, 119, 255, 0.1)"
        glowColor="rgba(34, 119, 255, 0.4)"
        gap={30}
      />
      
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 sm:py-32 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-blue-600">Our Story</h2>
          <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            Pioneering the <span className="text-gradient">intelligent workspace</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Rivexaflow exists to remove operational friction by combining enterprise discipline with modern product velocity.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-12 sm:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="font-heading text-2xl font-bold">Enterprise Reliability</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We combine enterprise-grade security and reliability with the speed of a modern startup. Our platform is built to handle the most demanding B2B operations with role-safe access and real-time monitoring.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="font-heading text-2xl font-bold">AI Native</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Intelligence isn't an afterthought—it's at our core. From KYC automation to predictive CRM insights, we leverage AI to reduce manual repetitive work and let teams focus on high-value impact.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 rounded-3xl bg-blue-600 p-8 text-white sm:p-12 shadow-2xl"
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight">Obsessed with Outcomes</h2>
              <p className="mt-4 text-lg text-blue-100 leading-relaxed">
                Our team obsesses over reliability, clarity, and measurable business outcomes. This POC demonstrates the seamless experience your stakeholders will see from day one.
              </p>
              <div className="mt-8 flex gap-6">
                <div className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-white" />
                  <span className="font-semibold text-white">Fast Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-white" />
                  <span className="font-semibold text-white">Client Focused</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20" />
                {/* Image placeholder or decorative element */}
                <div className="flex h-full items-center justify-center">
                  <span className="text-sm font-medium uppercase tracking-widest text-slate-500">Rivexaflow Infrastructure</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
