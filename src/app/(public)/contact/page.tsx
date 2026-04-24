"use client";

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as motion from "framer-motion/client";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900 selection:bg-blue-100 dark:bg-slate-950 dark:text-slate-50">
      <DottedGlowBackground 
        className="opacity-20" 
        color="rgba(0, 86, 255, 0.1)"
        glowColor="rgba(0, 86, 255, 0.4)"
        gap={30}
      />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-base font-semibold leading-7 text-blue-600">Get in touch</h2>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              Let's build your <span className="text-gradient">future workspace</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Tell us about your rollout timeline and specific operational requirements. Our enterprise solutions team will respond within one business day.
            </p>
            
            <dl className="mt-10 space-y-4 text-base leading-7 text-slate-600 dark:text-slate-400">
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Mail</span>
                  <Mail className="h-7 w-6 text-blue-600" aria-hidden="true" />
                </dt>
                <dd>
                  <a className="hover:text-blue-600 transition-colors" href="mailto:solutions@rivexaflow.com">
                    solutions@rivexaflow.com
                  </a>
                </dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Support</span>
                  <MessageSquare className="h-7 w-6 text-indigo-600" aria-hidden="true" />
                </dt>
                <dd>Support available 24/7 for Growth & Enterprise plans</dd>
              </div>
            </dl>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-slate-900/50 dark:shadow-none"
          >
            <form action="#" method="POST" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-semibold leading-6 text-slate-900 dark:text-white">
                    First name
                  </label>
                  <div className="mt-2.5">
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      autoComplete="given-name"
                      className="block w-full rounded-xl border-0 bg-slate-50 px-3.5 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-sm font-semibold leading-6 text-slate-900 dark:text-white">
                    Last name
                  </label>
                  <div className="mt-2.5">
                    <input
                      type="text"
                      name="last-name"
                      id="last-name"
                      autoComplete="family-name"
                      className="block w-full rounded-xl border-0 bg-slate-50 px-3.5 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold leading-6 text-slate-900 dark:text-white">
                  Work email
                </label>
                <div className="mt-2.5">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    className="block w-full rounded-xl border-0 bg-slate-50 px-3.5 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-semibold leading-6 text-slate-900 dark:text-white">
                  How can we help?
                </label>
                <div className="mt-2.5">
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    className="block w-full rounded-xl border-0 bg-slate-50 px-3.5 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500"
                    defaultValue={""}
                  />
                </div>
              </div>
              <div>
                <Button className="w-full rounded-xl py-6 text-base font-semibold shadow-lg transition-all hover:scale-[1.01] bg-blue-600 text-white hover:bg-blue-500">
                  Send Message <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
