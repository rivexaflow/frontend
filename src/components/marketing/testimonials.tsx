"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { Button } from "@/components/ui/button";
import { Star, Quote } from "lucide-react";
import * as motion from "framer-motion/client";

export function Testimonials() {
  const testimonials = [
    {
      quote: "Rivexaflow completely transformed how we manage client relationships. The AI automation alone saved us 20 hours per week.",
      name: "Sarah Chen",
      title: "CEO, TechStart Solutions",
    },
    {
      quote: "The best decision we made was switching to Rivexaflow. Everything from KYC to invoicing is now seamless.",
      name: "Michael Rodriguez",
      title: "Operations Director, FinEdge",
    },
    {
      quote: "Incredible platform! The team collaboration features and real-time dashboards have made us 3x more productive.",
      name: "Emily Watson",
      title: "Founder, NovaAssist",
    },
    {
      quote: "The infrastructure is world-class. We've seen a 40% reduction in operational overhead since migrating.",
      name: "David Park",
      title: "CTO, GlobalLogistics",
    },
    {
      quote: "Support is exceptional. Rivexaflow isn't just a tool, it's a strategic partner in our growth.",
      name: "James Wilson",
      title: "VP Operations, ScaleUp Inc",
    }
  ];

  return (
    <section className="relative py-24 sm:py-32 bg-slate-50 overflow-hidden dark:bg-slate-900/10">
      <DottedGlowBackground 
        className="opacity-30" 
        color="rgba(0, 86, 255, 0.05)"
        glowColor="rgba(0, 86, 255, 0.4)"
        gap={40}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-base font-semibold leading-7 text-blue-600">Testimonials</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Loved by teams <span className="text-gradient">worldwide</span>
          </p>
        </motion.div>

        <div className="flex flex-col items-center justify-center relative overflow-hidden">
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
            className="mt-10"
          />
        </div>
      </div>
    </section>
  );
}
