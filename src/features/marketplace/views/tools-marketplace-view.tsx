"use client";

import React, { useState, useEffect } from "react";
import { 
  Store, 
  Search, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  ShieldAlert, 
  MessageSquare, 
  FileSpreadsheet, 
  Share2, 
  Zap, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Star,
  Briefcase,
  Layers,
  FileText,
  Truck,
  Mail,
  BookOpen,
  BarChart2,
  Activity,
  Ticket
} from "lucide-react";
import Link from "next/link";

import { CrmPanel, CrmPanelBody } from "@/features/workspace/components/crm/crm-panel";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import { cn } from "@/lib/utils/cn";
import { apiClient } from "@/lib/api/client";

interface ToolCatalogItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  publisher: string;
  isOfficial: boolean;
  rating: number;
  reviewsCount: number;
  features: string[];
}

export function ToolsMarketplaceView() {
  const [catalog, setCatalog] = useState<ToolCatalogItem[]>([]);
  const [installedToolIds, setInstalledToolIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [currentUserRole] = useState<{ role: string; isOwner: boolean }>({
    role: "Company Owner",
    isOwner: true
  });

  const categories = ["All", "Communication & Sales", "Data & Operations", "Productivity & Team", "Automation"];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rivexaflow_installed_tools_v2");
      if (saved) {
        setInstalledToolIds(JSON.parse(saved));
      } else {
        const defaultInstalled = [
          "whatsapp",
          "google_sheets"
        ];
        localStorage.setItem("rivexaflow_installed_tools_v2", JSON.stringify(defaultInstalled));
        setInstalledToolIds(defaultInstalled);
      }
    }
    fetchCatalogAndInstalled();
  }, []);

  const fetchCatalogAndInstalled = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/tools-marketplace/catalog");
      if (res.data?.success && res.data.catalog) {
        setCatalog(res.data.catalog);
      } else {
        fallbackCatalog();
      }
    } catch (err) {
      fallbackCatalog();
    } finally {
      setLoading(false);
    }
  };

  const fallbackCatalog = () => {
    setCatalog([
      {
        id: "whatsapp",
        name: "WhatsApp Business API & CRM Chat",
        category: "Communication & Sales",
        description: "Connect WhatsApp via QR code login, assign numbers to team members, and chat with clients directly inside CRM while keeping full message history backup.",
        icon: "MessageSquare",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.9,
        reviewsCount: 128,
        features: ["QR Code Login & Instant Sync", "Department Head Team Assignment", "CRM Hierarchy Lead Chat Filtering", "Permanent Storage & Ban Protection"]
      },
      {
        id: "google_sheets",
        name: "Stockology Sheets & Spreadsheets",
        category: "Data & Operations",
        description: "Real-time collaborative spreadsheets embedded in your workspace. Synchronize lead lists, sales data, and automated reporting seamlessly.",
        icon: "FileSpreadsheet",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.8,
        reviewsCount: 94,
        features: ["Real-time Multi-user Collaboration", "CSV / Excel Import & Export", "CRM Lead Syncing & Formulas", "Custom Views & Field Mapping"]
      },
      {
        id: "projects",
        name: "Projects Board & Kanban",
        category: "Productivity & Team",
        description: "Configure project pipelines, task cards, backlogs milestones, and Trello-style statuses lists.",
        icon: "Briefcase",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.8,
        reviewsCount: 112,
        features: ["Kanban Board Operations", "Task Checklist Items", "Team Assignments", "Progress Meter Dashboard"]
      },
      {
        id: "inventory",
        name: "Inventory Stock Management",
        category: "Data & Operations",
        description: "Manage multiple warehouses catalogs, trace product listings, trace low stocks, and log stock movements.",
        icon: "Layers",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.7,
        reviewsCount: 88,
        features: ["Multi-warehouse Catalogs", "Stock Movements Audit Logs", "Low Stock Alerts threshold", "Product Catalogs list"]
      },
      {
        id: "pos",
        name: "POS Checkout Drawer Terminal",
        category: "Communication & Sales",
        description: "Retail checkout screen. Register transaction, process discounts, calculate VAT taxes, and generate receipt prints.",
        icon: "Store",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.9,
        reviewsCount: 154,
        features: ["Cash Drawer Checkout Terminal", "Auto VAT & Discount calculations", "Interactive product search selection", "Printable receipt formatters"]
      },
      {
        id: "sales",
        name: "Sales Orders Pipeline",
        category: "Communication & Sales",
        description: "Generate quotes proposals, register customers acceptances, and convert quotes into sales orders.",
        icon: "FileText",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.8,
        reviewsCount: 79,
        features: ["Customer Proposal Generator", "Quotation to Sales Order conversion", "Client details history ledger", "Order fulfill status updates"]
      },
      {
        id: "purchase",
        name: "Purchase Orders & Vendor Supply",
        category: "Data & Operations",
        description: "Log vendors listings, maintain supplier addresses, compile purchase pipelines, and record supply logs.",
        icon: "FileText",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.6,
        reviewsCount: 61,
        features: ["Vendor Supply Catalogs", "Purchase Orders pipeline", "Deliveries tracking status", "Costing logs audit details"]
      },
      {
        id: "logistics",
        name: "Logistics Tracking & Path Router",
        category: "Data & Operations",
        description: "Register logistics hub cargos, trace shipment consignment route waypoints, and optimize TSP paths.",
        icon: "Truck",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.7,
        reviewsCount: 45,
        features: ["Consignment Tracker route details", "Path sequence solver logic", "Waypoints delivery checkpoints", "Optimized mileage router solver"]
      },
      {
        id: "pdf-editor",
        name: "PDF Template Canvas Editor",
        category: "Productivity & Team",
        description: "Drag template elements. Compile invoices headings, text notes, margins alignments, and merge documents.",
        icon: "FileText",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.8,
        reviewsCount: 83,
        features: ["Canvas Document component layout", "Table element rows configurator", "JSON structural compiler", "PDF Multi-files Merger engine"]
      },
      {
        id: "email-marketing",
        name: "Email Marketing & Campaigns",
        category: "Communication & Sales",
        description: "Schedule bulk marketing mailings, manage templates designs, and compile subscribers database lists.",
        icon: "Mail",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.7,
        reviewsCount: 97,
        features: ["Bulk newsletter campaigns compiler", "Template drafts catalog", "Subscribers segment builders", "Deliverability success reports"]
      },
      {
        id: "accounting",
        name: "Accounting Ledger & journal",
        category: "Data & Operations",
        description: "General double-entry accounting ledger entries. Chart of accounts registry, assets/liability categories, and credit/debit balances.",
        icon: "BookOpen",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.9,
        reviewsCount: 110,
        features: ["Double-entry Journal logs", "Debit / Credit balance registers", "Chart of accounts selector", "Financial statement summaries"]
      },
      {
        id: "budgeting",
        name: "Budgeting Plans Allocations",
        category: "Data & Operations",
        description: "Define corporate budgeting cycles, track department variances, and view actual vs allocated expenditures.",
        icon: "BarChart2",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.8,
        reviewsCount: 71,
        features: ["Budget Plan periods calendar", "Target allocation limits", "Department variance graph", "Expenditure meters warning indicators"]
      },
      {
        id: "sla",
        name: "SLA Support Policies",
        category: "Productivity & Team",
        description: "Define service response times, first touch milestones warnings limits, and configure escalation contacts.",
        icon: "ShieldCheck",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.8,
        reviewsCount: 52,
        features: ["Ticket SLA breach alarms", "Warning lead minutes limit", "Escalation Contacts directory", "Priority rules filters definition"]
      },
      {
        id: "dupliguard",
        name: "DupliGuard Duplicate Scan",
        category: "Automation",
        description: "Database deduplicator scans. Check duplicate email/phone indices, score similarity matches, and auto-merge profiles.",
        icon: "Activity",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.9,
        reviewsCount: 130,
        features: ["Similarity score check threshold", "Batch database scans scheduler", "Email & Phone index filters", "Auto-merge profile parameters"]
      },
      {
        id: "tickets",
        name: "Customer Support Tickets System",
        category: "Productivity & Team",
        description: "Raise query requests, monitor unresolved ticket queues, and live chat with support managers.",
        icon: "Ticket",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.8,
        reviewsCount: 76,
        features: ["Support Ticket submission form", "Active / Closed ticket directory", "Live chat reply messaging thread", "SLA tracking metrics alerts"]
      },
      {
        id: "slack_integration",
        name: "Slack Alerts & Notifications",
        category: "Productivity & Team",
        description: "Get instant notifications in your Slack channels when deals are won, leads arrive, or high-priority support tickets are created.",
        icon: "Slack",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.7,
        reviewsCount: 65,
        features: ["Real-time Lead Notifications", "Deal Stage Updates", "Custom Webhook Channel Routing"]
      },
      {
        id: "zapier",
        name: "Zapier Webhook Connector",
        category: "Automation",
        description: "Connect Rivexa SaaS with 5,000+ apps using automated Zaps. Trigger workflows and send data across all your external tools.",
        icon: "Zap",
        publisher: "Rivexa Flow",
        isOfficial: true,
        rating: 4.9,
        reviewsCount: 210,
        features: ["Inbound & Outbound Webhooks", "Automated Multi-step Actions", "Custom Payload Mapping"]
      }
    ]);
  };

  const handleToggleInstall = async (toolId: string) => {
    setInstallingId(toolId);
    setTimeout(() => {
      let updated: string[];
      if (installedToolIds.includes(toolId)) {
        updated = installedToolIds.filter(id => id !== toolId);
      } else {
        updated = [...installedToolIds, toolId];
      }
      setInstalledToolIds(updated);
      localStorage.setItem("rivexaflow_installed_tools_v2", JSON.stringify(updated));
      setInstallingId(null);
    }, 600);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "MessageSquare": return <MessageSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />;
      case "FileSpreadsheet": return <FileSpreadsheet className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case "Slack": return <Share2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />;
      case "Zap": return <Zap className="h-6 w-6 text-amber-500 dark:text-amber-400" />;
      case "Briefcase": return <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      case "Layers": return <Layers className="h-6 w-6 text-sky-600 dark:text-sky-400" />;
      case "Store": return <Store className="h-6 w-6 text-orange-600 dark:text-orange-400" />;
      case "FileText": return <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />;
      case "Truck": return <Truck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />;
      case "Mail": return <Mail className="h-6 w-6 text-pink-600 dark:text-pink-400" />;
      case "BookOpen": return <BookOpen className="h-6 w-6 text-violet-600 dark:text-violet-400" />;
      case "BarChart2": return <BarChart2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      case "ShieldCheck": return <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />;
      case "Activity": return <Activity className="h-6 w-6 text-rose-600 dark:text-rose-400" />;
      case "Ticket": return <Ticket className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />;
      default: return <Sparkles className="h-6 w-6 text-[#191970] dark:text-indigo-400" />;
    }
  };

  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className={crm.page}>
      {/* PAGE HEADER STRIP MATCHING CRM THEME */}
      <CrmPageHeader
        metrics={[
          { label: "Available Tools", value: catalog.length },
          { label: "Active Installed", value: installedToolIds.length },
          { label: "Access Privilege", value: "Company Owner" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Owner Authorization Active
            </span>
          </div>
        }
      />

      {/* TITLE & HERO BANNER CARD */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#191970] dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-400 mb-3">
              <Store className="h-3.5 w-3.5" /> Operations Marketplace
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Workspace Tools & Modular Extensions
            </h1>
            <p className="mt-2 max-w-3xl text-sm md:text-base text-slate-600 dark:text-slate-300">
              Discover, integrate, and deploy operational tools into your workspace with 1-click installation. Connect WhatsApp Business, Google Sheets, Slack, and automation webhooks.
            </p>
          </div>

          <Link
            href="/crm/whatsapp"
            className={cn(crm.btnPrimary, "shrink-0 shadow-sm")}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Open WhatsApp CRM</span>
          </Link>
        </div>
      </div>

      {/* OWNER ACCESS POLICY NOTICE */}
      {!currentUserRole.isOwner && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200 shadow-xs">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold">Restricted Marketplace Management</h4>
            <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300/80">
              Only Company Owners have authorization to install or configure new third-party integrations for the organization. Contact your company owner to add tools.
            </p>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tools & integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(crm.input, "pl-9 w-full")}
          />
        </div>

        {/* Categories Filter Pills */}
        <div className="flex w-full md:w-auto items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all",
                selectedCategory === category
                  ? "bg-[#191970] text-white shadow-sm hover:bg-[#12124a]"
                  : "border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* TOOLS GRID */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#191970] dark:text-indigo-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCatalog.map(tool => {
            const isInstalled = installedToolIds.includes(tool.id);
            const isInstalling = installingId === tool.id;

            return (
              <CrmPanel key={tool.id} className="group relative flex flex-col justify-between transition-all duration-200 hover:shadow-md">
                <CrmPanelBody className="flex flex-col justify-between h-full p-6">
                  <div>
                    {/* Top Info & Rating */}
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 shadow-xs group-hover:scale-105 transition-transform dark:border-slate-800 dark:bg-slate-950">
                          {renderIcon(tool.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#191970] transition-colors dark:text-white dark:group-hover:text-indigo-400">
                              {tool.name}
                            </h3>
                            {tool.isOfficial && (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-400">
                                Official
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{tool.category}</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {tool.rating} ({tool.reviewsCount})
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {tool.description}
                    </p>

                    {/* Key Features List */}
                    <div className="mb-6 space-y-2">
                      <span className={crm.sectionLabel}>Key Capabilities</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {tool.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#191970] dark:text-indigo-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Provided by <span className="font-semibold text-slate-700 dark:text-slate-200">{tool.publisher}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isInstalled && tool.id === "whatsapp" && (
                        <Link
                          href="/crm/whatsapp"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                        >
                          Open Chat <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}

                      {isInstalled && tool.id === "google_sheets" && (
                        <Link
                          href="/sheets"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                        >
                          View Sheets <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}

                      <button
                        onClick={() => handleToggleInstall(tool.id)}
                        disabled={isInstalling || !currentUserRole.isOwner}
                        className={cn(
                          isInstalled ? crm.btnSecondarySm : crm.btnPrimarySm,
                          "px-4"
                        )}
                      >
                        {isInstalling ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Processing...
                          </>
                        ) : isInstalled ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Installed
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" /> Install Tool
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </CrmPanelBody>
              </CrmPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
