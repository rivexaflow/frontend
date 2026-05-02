"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function LogoCloud() {
  const logos = [
    { name: "Enterprise A", src: "/brain/8f6eee7f-e4d4-44ee-9b21-198ffbf0763a/enterprise_logos_set_1777032813921.png" },
    // Since we have one image with multiple logos, we can either crop it or just show it as a strip.
    // For now, I'll show the whole strip with a subtle animation to represent multiple partners.
  ];

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-sm font-semibold leading-8 text-slate-500 uppercase tracking-widest mb-10">
          Trusted by high-growth enterprise teams
        </h2>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto flex justify-center items-center opacity-70 hover:opacity-100 transition-opacity"
        >
          {/* Using the generated set of logos as a group showcase */}
          <div className="relative h-20 w-full max-w-4xl overflow-hidden grayscale brightness-125 contrast-75">
            <Image
              src="/static/logos/enterprise_logos_set.png"
              alt="Trusted Partner Logos"
              fill
              className="object-contain"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
