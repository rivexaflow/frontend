"use client";

import { ArrowLeft, ArrowRight, Brain, FileText, MessageSquare, Search, Users, Zap } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

type ServiceItem = {
  id: number;
  image: string;
  thumb: string;
  alt: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const ITEMS: ServiceItem[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&h=700&q=80",
    thumb:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=220&h=124&q=60",
    alt: "CRM analytics dashboard",
    title: "Advanced CRM Automation",
    description: "Manage leads, conversations, and follow-ups from one intelligent workspace.",
    icon: Users,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&h=700&q=80",
    thumb:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=220&h=124&q=60",
    alt: "Secure KYC processing",
    title: "Digital KYC Intelligence",
    description: "Accelerate verification workflows with secure document parsing and validation.",
    icon: Search,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&h=700&q=80",
    thumb:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=220&h=124&q=60",
    alt: "Smart invoicing operations",
    title: "Smart Invoicing Stack",
    description: "Generate, track, and reconcile invoices in real time across teams and clients.",
    icon: FileText,
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=700&q=80",
    thumb:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=220&h=124&q=60",
    alt: "Business reporting and dashboards",
    title: "Real-Time Reporting",
    description: "Turn operational data into actionable metrics with live business intelligence.",
    icon: Brain,
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&h=700&q=80",
    thumb:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=220&h=124&q=60",
    alt: "Team collaboration workflow",
    title: "Workflow Collaboration",
    description: "Coordinate approvals, tasks, and ownership in one collaborative process layer.",
    icon: Zap,
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&h=700&q=80",
    thumb:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=220&h=124&q=60",
    alt: "Customer communication channels",
    title: "Omnichannel Communications",
    description: "Orchestrate email, WhatsApp, and messaging touchpoints from one platform.",
    icon: MessageSquare,
  },
];

export function ServicesFlyingGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  const ordered = useMemo(() => {
    return ITEMS.map((item, i) => {
      const diff = i - activeIndex;
      const side = diff < 0 ? "prev" : diff > 0 ? "next" : "active";
      return {
        ...item,
        index: i,
        side,
        offset: Math.abs(diff),
      };
    });
  }, [activeIndex]);

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + ITEMS.length) % ITEMS.length);
  const goNext = () => setActiveIndex((prev) => Math.min(prev + 1, ITEMS.length - 1));

  return (
    <div className="service-root relative mt-0 flex flex-col gap-4 overflow-hidden rounded-[1.5rem] bg-transparent px-0 py-3 text-white">
      <div className="slide-area relative">
        <button type="button" onClick={goPrev} className="nav-btn nav-prev" aria-label="Previous service">
          <ArrowLeft className="nav-icon" aria-hidden="true" />
        </button>
        {activeIndex < ITEMS.length - 1 ? (
          <button type="button" onClick={goNext} className="nav-btn nav-next" aria-label="Next service">
            <ArrowRight className="nav-icon" aria-hidden="true" />
          </button>
        ) : null}

        <div className="relative mx-auto h-[64vw] max-h-[740px] min-h-[390px] w-full max-w-[1380px] [perspective:1000px]">
          {ordered.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveIndex(item.index)}
              className="item absolute left-1/2 top-1/2 block w-[min(980px,90vw)] -translate-x-1/2 -translate-y-1/2 text-left"
              data-side={item.side}
              style={
                {
                  "--center-offset": item.offset,
                  "--i": item.index,
                } as CSSProperties
              }
            >
              <div className="slide relative overflow-hidden rounded-xl">
                <img src={item.image} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E3E7FC]/55 bg-black/45 shadow-[0_10px_26px_rgba(0,86,255,0.45)] backdrop-blur-md sm:left-6 sm:top-6 sm:h-14 sm:w-14">
                  <item.icon className="h-6 w-6 text-[#E3E7FC] sm:h-7 sm:w-7" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <p className="font-heading text-[1.7rem] font-black leading-none tracking-tight text-[#E3E7FC] sm:text-[2rem]">
                    0{item.id}
                  </p>
                  <h3 className="font-heading text-[1.6rem] font-extrabold leading-tight text-white sm:text-[2.1rem]">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-[1rem] leading-6 text-white/90 sm:text-[1.12rem] sm:leading-7">
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .slide {
          aspect-ratio: 16 / 9;
          transition: transform 0.55s, filter 0.55s, opacity 0.55s;
        }
        .item[data-side="active"] .slide {
          filter: none;
          opacity: 1;
          transform: perspective(1000px);
          z-index: 20;
        }
        .item[data-side="prev"] .slide {
          filter: blur(calc(var(--center-offset) * 2px));
          opacity: calc(1 - var(--center-offset) * 0.68);
          transform: perspective(1000px)
            translateX(calc(var(--center-offset) * -600px))
            translateY(calc(var(--center-offset) * -180px))
            translateZ(calc(var(--center-offset) * 40px))
            rotateZ(calc(var(--center-offset) * -14deg));
        }
        .item[data-side="next"] .slide {
          filter: blur(calc(var(--center-offset) * 2px));
          opacity: calc(1 - var(--center-offset) * 0.3);
          transform: perspective(1000px)
            translateX(calc(var(--center-offset) * 600px))
            translateY(calc(var(--center-offset) * 180px))
            translateZ(calc(var(--center-offset) * -80px))
            rotateZ(calc(var(--center-offset) * 14deg));
        }
        .nav-btn {
          position: absolute;
          top: 50%;
          z-index: 30;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 3.65rem;
          width: 3.65rem;
          transform: translateY(-50%);
          border-radius: 999px;
          border: 1px solid rgb(255 255 255 / 72%);
          background: linear-gradient(180deg, rgb(255 255 255 / 96%), rgb(244 248 255 / 94%));
          box-shadow:
            0 12px 28px rgb(25 25 112 / 22%),
            inset 0 1px 0 rgb(255 255 255 / 95%);
          color: #0056ff;
          backdrop-filter: blur(10px);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s, background 0.2s, color 0.2s;
        }
        .nav-icon {
          height: 1.55rem;
          width: 1.55rem;
          stroke-width: 2.6;
        }
        .nav-btn:hover {
          transform: translateY(-50%) scale(1.04);
          background: linear-gradient(180deg, rgb(255 255 255 / 100%), rgb(230 239 255 / 98%));
          border-color: rgb(34 119 255 / 55%);
          color: #004ae0;
          box-shadow: 0 15px 34px rgb(34 119 255 / 25%);
        }
        .nav-btn:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 3px rgb(255 255 255 / 88%),
            0 0 0 6px rgb(34 119 255 / 46%),
            0 12px 28px rgb(25 25 112 / 22%);
        }
        .nav-btn:active {
          transform: translateY(-50%) scale(0.96);
          background: linear-gradient(180deg, rgb(220 234 255 / 98%), rgb(206 225 255 / 98%));
          border-color: rgb(34 119 255 / 72%);
          color: #ffffff;
          box-shadow: 0 8px 18px rgb(34 119 255 / 32%);
        }
        .nav-prev {
          left: 1.5rem;
        }
        .nav-next {
          right: 1.5rem;
        }
        @media (max-width: 1023px) {
          .service-root {
            border-radius: 1rem;
          }
          .nav-btn {
            height: 3.1rem;
            width: 3.1rem;
          }
          .nav-icon {
            height: 1.35rem;
            width: 1.35rem;
          }
          .item[data-side="prev"] .slide,
          .item[data-side="next"] .slide {
            opacity: 0;
            transform: perspective(1000px) translateX(0) translateY(0) translateZ(0) rotateZ(0);
            pointer-events: none;
          }
          .item {
            width: min(94vw, 840px);
          }
        }
      `}</style>
    </div>
  );
}

