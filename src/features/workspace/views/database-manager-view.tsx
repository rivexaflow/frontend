"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  Server, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Clock, 
  Activity, 
  Plus, 
  RefreshCw,
  HardDrive,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { workspaceStore } from "@/stores/workspace.store";
import { cn } from "@/lib/utils/cn";

interface Connection {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  databaseName: string;
  role: string;
  status: string;
  syncSchedule?: string;
  lastSyncedAt?: string;
  nextSyncAt?: string;
}

interface SyncLog {
  id: string;
  status: string;
  durationMs: number;
  recordsSynced: number;
  errorMessage?: string | null;
  createdAt: string;
}

function hexToRgb(hex: string): string {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map(char => char + char).join("");
  }
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

export function DatabaseManagerView() {
  const companyId = useHrCompanyId();
  
  // Dynamic Workspace Theme
  const themeConfig = workspaceStore((s) => s.themeConfig);
  const primaryColor = themeConfig?.primaryColor || "#191970";
  const primaryRgb = hexToRgb(primaryColor);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "add" | "logs">("list");
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("mysql");
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState(3306);
  const [username, setUsername] = useState("root");
  const [password, setPassword] = useState("");
  const [databaseName, setDatabaseName] = useState("");
  const [connectionUrl, setConnectionUrl] = useState("");
  const [sslEnabled, setSslEnabled] = useState(false);

  // Load database connections
  const fetchConnections = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/database-connections?companyId=${companyId}`);
      if (res.data && res.data.data) {
        setConnections(res.data.data);
        if (res.data.data.length > 0 && !selectedConnection) {
          setSelectedConnection(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load database connections", err);
    } finally {
      setLoading(false);
    }
  };

  // Load sync logs
  const fetchSyncLogs = async () => {
    if (!companyId) return;
    try {
      const res = await apiClient.get(`/database-connections/sync/logs?companyId=${companyId}`);
      if (res.data && res.data.data) {
        setSyncLogs(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load sync logs", err);
    }
  };

  useEffect(() => {
    fetchConnections();
    fetchSyncLogs();
  }, [companyId]);

  // Adjust port based on type selection
  useEffect(() => {
    if (type === "mysql") setPort(3306);
    else if (type === "postgresql") setPort(5432);
    else if (type === "mongodb") setPort(27017);
  }, [type]);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await apiClient.post("/database-connections/test", {
        type,
        host,
        port,
        username,
        password,
        databaseName,
        connectionUrl: connectionUrl || null,
        sslEnabled
      });
      setTestResult({
        success: res.data.success,
        message: res.data.message || "Connection verified successfully!"
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || "Failed to establish connection to target database."
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!connectionUrl && (!host || !databaseName || !username))) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/database-connections", {
        companyId,
        name,
        type,
        host,
        port,
        username,
        password,
        databaseName,
        connectionUrl: connectionUrl || null,
        sslEnabled
      });
      setName("");
      setPassword("");
      setConnectionUrl("");
      setTestResult(null);
      setActiveTab("list");
      fetchConnections();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save connection profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    setLoading(true);
    try {
      await apiClient.post(`/database-connections/${id}/role`, { role });
      fetchConnections();
      if (selectedConnection && selectedConnection.id === id) {
        setSelectedConnection(prev => prev ? { ...prev, role } : null);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update connection role.");
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSync = async (id: string) => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/database-connections/${id}/sync`);
      alert(res.data.message || "Backup completed successfully!");
      fetchSyncLogs();
      fetchConnections();
    } catch (err: any) {
      alert(err.response?.data?.error || "Sync execution failed.");
    } finally {
      setLoading(false);
    }
  };

  const primaryDb = connections.find(c => c.role === "primary");
  const backupDb = connections.find(c => c.role === "backup");

  return (
    <div className="min-height-screen bg-[#07070c] text-slate-100 font-sans p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Modern Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>System Operations</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-1 flex items-center gap-2.5">
              <Database className="h-8 w-8" style={{ color: primaryColor }} />
              Database Manager
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
              Connect external databases to dynamically route your operational CRM, HR, and Accounting records, keeping your customer data isolated and private.
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={fetchConnections}
              disabled={loading}
              className="p-2.5 bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-200"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Dynamic Neon Dashboard Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Primary DB Status */}
          <div className="relative group overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/40 to-slate-950/60 p-5 backdrop-blur-xl">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full blur-2xl" style={{ backgroundColor: `rgba(${primaryRgb}, 0.1)` }} />
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500 block uppercase">Primary database</span>
                <span className="text-2xl font-bold text-slate-100 tracking-tight">
                  {primaryDb ? primaryDb.name : "Local Sandbox"}
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  {primaryDb ? `Engine: ${primaryDb.type.toUpperCase()}` : "Using central schema"}
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `rgba(${primaryRgb}, 0.1)`, borderColor: `rgba(${primaryRgb}, 0.2)` }}>
                <ShieldCheck className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className={cn(
                "h-2 w-2 rounded-full",
                primaryDb?.status === "connected" ? "bg-emerald-500" : "bg-slate-600"
              )} />
              <span className="text-slate-500 font-medium">
                {primaryDb?.status === "connected" ? "Active and routing queries" : "Central fallback mode"}
              </span>
            </div>
          </div>

          {/* Card 2: Backup DB Status */}
          <div className="relative group overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/40 to-slate-950/60 p-5 backdrop-blur-xl">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full blur-2xl" style={{ backgroundColor: `rgba(${primaryRgb}, 0.1)` }} />
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500 block uppercase">Backup targets</span>
                <span className="text-2xl font-bold text-slate-100 tracking-tight">
                  {backupDb ? backupDb.name : "None configured"}
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  {backupDb ? `Type: ${backupDb.type.toUpperCase()}` : "Manual replication only"}
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `rgba(${primaryRgb}, 0.1)`, borderColor: `rgba(${primaryRgb}, 0.2)` }}>
                <HardDrive className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className={cn(
                "h-2 w-2 rounded-full",
                backupDb?.status === "connected" ? "bg-indigo-500" : "bg-slate-600"
              )} />
              <span className="text-slate-500 font-medium">
                {backupDb ? `Scheduled: ${backupDb.syncSchedule || "Daily"}` : "No scheduled snapshots"}
              </span>
            </div>
          </div>

          {/* Card 3: Operations latency */}
          <div className="relative group overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-b from-slate-900/40 to-slate-950/60 p-5 backdrop-blur-xl">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full blur-2xl" style={{ backgroundColor: `rgba(${primaryRgb}, 0.1)` }} />
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500 block uppercase">Performance metrics</span>
                <span className="text-2xl font-bold text-slate-100 tracking-tight">
                  {primaryDb ? "Active Routing" : "Default Mode"}
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  Average Query Latency: ~14ms
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `rgba(${primaryRgb}, 0.1)`, borderColor: `rgba(${primaryRgb}, 0.2)` }}>
                <Cpu className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span className="text-slate-500 font-medium">Connections pool optimized</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-900/80 gap-6">
          <button
            onClick={() => setActiveTab("list")}
            className={cn(
              "pb-3 text-sm font-semibold transition-all relative",
              activeTab === "list" ? "text-slate-100" : "text-slate-500 hover:text-slate-300"
            )}
            style={{ color: activeTab === "list" ? primaryColor : undefined }}
          >
            {activeTab === "list" && (
              <motion.span layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: primaryColor }} />
            )}
            Connections Profile
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={cn(
              "pb-3 text-sm font-semibold transition-all relative flex items-center gap-1",
              activeTab === "add" ? "text-slate-100" : "text-slate-500 hover:text-slate-300"
            )}
            style={{ color: activeTab === "add" ? primaryColor : undefined }}
          >
            {activeTab === "add" && (
              <motion.span layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: primaryColor }} />
            )}
            <Plus className="h-4 w-4" /> Add Connection
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={cn(
              "pb-3 text-sm font-semibold transition-all relative",
              activeTab === "logs" ? "text-slate-100" : "text-slate-500 hover:text-slate-300"
            )}
            style={{ color: activeTab === "logs" ? primaryColor : undefined }}
          >
            {activeTab === "logs" && (
              <motion.span layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: primaryColor }} />
            )}
            Sync logs
          </button>
        </div>

        {/* Display Content Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <AnimatePresence mode="wait">
            
            {/* Tab 1: Profile Lists */}
            {activeTab === "list" && (
              <>
                {/* Left side list */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="lg:col-span-1 space-y-4"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Connection Profiles</span>
                  
                  {connections.length === 0 ? (
                    <div className="p-8 border border-slate-900 rounded-2xl bg-slate-950/20 text-center text-slate-600 text-sm">
                      No connections configured. Click "Add Connection" above to get started.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {connections.map((conn) => {
                        const isActive = selectedConnection?.id === conn.id;
                        return (
                          <div
                            key={conn.id}
                            onClick={() => {
                              setSelectedConnection(conn);
                              setTestResult(null);
                            }}
                            className={cn(
                              "p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group",
                              isActive
                                ? "shadow-md"
                                : "border-slate-800/80 bg-slate-950/30 hover:border-slate-700/80"
                            )}
                            style={{
                              borderColor: isActive ? primaryColor : undefined,
                              backgroundColor: isActive ? `rgba(${primaryRgb}, 0.05)` : undefined,
                              boxShadow: isActive ? `0 4px 12px rgba(${primaryRgb}, 0.05)` : undefined
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm select-none border",
                                conn.type === "mysql" && "bg-cyan-500/10 text-cyan-400 border-cyan-500/10",
                                conn.type === "mongodb" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/10",
                                conn.type === "postgresql" && "bg-indigo-500/10 text-indigo-400 border-indigo-500/10"
                              )}>
                                {conn.type === "mysql" && "My"}
                                {conn.type === "postgresql" && "Pg"}
                                {conn.type === "mongodb" && "Mg"}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-sm text-slate-200 group-hover:text-slate-100 transition-colors">
                                    {conn.name}
                                  </span>
                                  {conn.role !== "none" && (
                                    <span 
                                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase border"
                                      style={{
                                        backgroundColor: conn.role === "primary" ? `rgba(16, 185, 129, 0.1)` : `rgba(${primaryRgb}, 0.1)`,
                                        borderColor: conn.role === "primary" ? `rgba(16, 185, 129, 0.2)` : `rgba(${primaryRgb}, 0.2)`,
                                        color: conn.role === "primary" ? "#10b981" : primaryColor
                                      }}
                                    >
                                      {conn.role}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  {conn.host}:{conn.port} • {conn.databaseName}
                                </span>
                              </div>
                            </div>
                            
                            <span className={cn(
                              "h-2 w-2 rounded-full",
                              conn.status === "connected" && "bg-emerald-400 shadow-md shadow-emerald-400/50",
                              conn.status === "disconnected" && "bg-slate-600",
                              conn.status === "error" && "bg-rose-500 shadow-md shadow-rose-500/50"
                            )} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>

                {/* Right side Detail panel */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="lg:col-span-2"
                >
                  {selectedConnection ? (
                    <div className="border border-slate-800 rounded-2xl bg-slate-950/20 p-6 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                              {selectedConnection.type}
                            </span>
                            <span className="text-[11px] text-slate-600">ID: {selectedConnection.id}</span>
                          </div>
                          <h3 className="text-xl font-bold text-white mt-1.5">{selectedConnection.name}</h3>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateRole(selectedConnection.id, "primary")}
                            disabled={selectedConnection.role === "primary" || loading}
                            className={cn(
                              "text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5",
                              selectedConnection.role === "primary"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default"
                                : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                            )}
                          >
                            Set Primary
                          </button>
                          <button
                            onClick={() => handleUpdateRole(selectedConnection.id, "backup")}
                            disabled={selectedConnection.role === "backup" || loading}
                            className={cn(
                              "text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5",
                              selectedConnection.role === "backup"
                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 cursor-default"
                                : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                            )}
                            style={{
                              backgroundColor: selectedConnection.role === "backup" ? `rgba(${primaryRgb}, 0.1)` : undefined,
                              color: selectedConnection.role === "backup" ? primaryColor : undefined,
                              borderColor: selectedConnection.role === "backup" ? `rgba(${primaryRgb}, 0.2)` : undefined
                            }}
                          >
                            Set Backup
                          </button>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-1">
                          <span className="text-slate-500 block text-xs font-medium uppercase tracking-wider">Host Server</span>
                          <span className="font-semibold text-slate-200">{selectedConnection.host}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-500 block text-xs font-medium uppercase tracking-wider">Port</span>
                          <span className="font-semibold text-slate-200">{selectedConnection.port}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-500 block text-xs font-medium uppercase tracking-wider">Database / Schema</span>
                          <span className="font-semibold" style={{ color: primaryColor }}>{selectedConnection.databaseName}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-500 block text-xs font-medium uppercase tracking-wider">Status Connection</span>
                          <span className={cn(
                            "font-bold uppercase text-xs flex items-center gap-1.5",
                            selectedConnection.status === "connected" && "text-emerald-400",
                            selectedConnection.status === "disconnected" && "text-slate-400",
                            selectedConnection.status === "error" && "text-rose-400"
                          )}>
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              selectedConnection.status === "connected" && "bg-emerald-400",
                              selectedConnection.status === "disconnected" && "bg-slate-400",
                              selectedConnection.status === "error" && "bg-rose-400"
                            )} />
                            {selectedConnection.status}
                          </span>
                        </div>
                      </div>

                      {/* Sync scheduler detail panel */}
                      {selectedConnection.role === "backup" && (
                        <div className="rounded-xl border p-4 space-y-4" style={{ backgroundColor: `rgba(${primaryRgb}, 0.05)`, borderColor: `rgba(${primaryRgb}, 0.1)` }}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5" style={{ color: primaryColor }} />
                            <div>
                              <h4 className="font-semibold text-slate-200 text-sm">Backup Scheduler</h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Automated sync mapping replicates leads, deals, and team settings from the active Primary SQL database.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-900/60 pt-3 gap-2">
                            <span className="text-xs text-slate-500">
                              Schedule Frequency: <strong className="uppercase ml-1" style={{ color: primaryColor }}>{selectedConnection.syncSchedule || "None"}</strong>
                            </span>
                            <button
                              onClick={() => handleTriggerSync(selectedConnection.id)}
                              disabled={loading}
                              className="px-3.5 py-1.5 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                              style={{ backgroundColor: primaryColor, boxShadow: `0 4px 12px rgba(${primaryRgb}, 0.15)` }}
                            >
                              <Play className="h-3.5 w-3.5 text-white" /> Force Snapshot Sync
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-800 rounded-2xl h-80 flex flex-col items-center justify-center text-slate-500 p-6">
                      <Server className="h-12 w-12 text-slate-700 mb-3" />
                      <p className="text-sm font-semibold">No connection selected</p>
                      <p className="text-xs text-slate-600 mt-1">Choose a connection profile from the list to manage.</p>
                    </div>
                  )}
                </motion.div>
              </>
            )}

            {/* Tab 2: Add Connection Form */}
            {activeTab === "add" && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="lg:col-span-3 max-w-2xl mx-auto w-full border border-slate-800/80 bg-slate-950/20 rounded-2xl p-6 space-y-6"
              >
                <div className="border-b border-slate-900 pb-4">
                  <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Plus className="h-5 w-5" style={{ color: primaryColor }} /> New Connection Profile
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Configure credentials for MySQL, PostgreSQL or MongoDB connection.</p>
                </div>

                <form onSubmit={handleSaveConnection} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-semibold text-slate-400">Connection Display Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Hostinger Production DB"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none transition-all placeholder:text-slate-600"
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Database Engine *</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none transition-all"
                      >
                        <option value="mysql">MySQL</option>
                        <option value="postgresql">PostgreSQL</option>
                        <option value="mongodb">MongoDB</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Host Address *</label>
                      <input
                        type="text"
                        required
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="e.g. 193.203.184.192"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Port *</label>
                      <input
                        type="number"
                        required
                        value={port}
                        onChange={(e) => setPort(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Database / Schema Name *</label>
                      <input
                        type="text"
                        required
                        value={databaseName}
                        onChange={(e) => setDatabaseName(e.target.value)}
                        placeholder="e.g. u569154749_rivexa_crm"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Username *</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="db_username"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-semibold text-slate-400">Connection URL Override (Alternative)</label>
                      <input
                        type="text"
                        value={connectionUrl}
                        onChange={(e) => setConnectionUrl(e.target.value)}
                        placeholder="mysql://user:pass@host:3306/db"
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="ssl"
                      checked={sslEnabled}
                      onChange={(e) => setSslEnabled(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-indigo-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                      style={{ color: primaryColor }}
                    />
                    <label htmlFor="ssl" className="text-xs font-semibold text-slate-400 cursor-pointer select-none">
                      Enable SSL Enforce (Encrypted connection mode)
                    </label>
                  </div>

                  {testResult && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "p-4 rounded-xl border flex items-start gap-2.5 text-xs",
                        testResult.success
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      )}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
                      )}
                      <div>
                        <span className="font-bold block mb-0.5">
                          {testResult.success ? "Database credentials valid" : "Database verification failed"}
                        </span>
                        <span>{testResult.message}</span>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-end gap-3 pt-5 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testingConnection || loading}
                      className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 hover:text-slate-100 font-semibold text-sm rounded-xl transition-all"
                    >
                      {testingConnection ? "Testing connection..." : "Test Connection"}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-white font-semibold text-sm rounded-xl transition-all shadow-lg"
                      style={{ backgroundColor: primaryColor, boxShadow: `0 4px 12px rgba(${primaryRgb}, 0.15)` }}
                    >
                      Register Profile
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Tab 3: Logs */}
            {activeTab === "logs" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:col-span-3 border border-slate-800/80 bg-slate-950/20 rounded-2xl p-6 space-y-4"
              >
                <div className="border-b border-slate-900 pb-4">
                  <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Activity className="h-5 w-5" style={{ color: primaryColor }} /> Activity Sync Logs
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Audit trail of background backup tasks executed by the synchronization service daemon.</p>
                </div>

                {syncLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-600 text-sm border border-slate-800 border-dashed rounded-xl">
                    No sync records found in target audit trail.
                  </div>
                ) : (
                  <div className="overflow-hidden border border-slate-900 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900/40 text-slate-400 border-b border-slate-900">
                          <th className="py-3 px-4 font-semibold">Date & Time</th>
                          <th className="py-3 px-4 font-semibold">Status</th>
                          <th className="py-3 px-4 font-semibold">Records Synced</th>
                          <th className="py-3 px-4 font-semibold">Time Elapsed</th>
                          <th className="py-3 px-4 font-semibold">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {syncLogs.map((log) => (
                          <tr key={log.id} className="border-b border-slate-900 hover:bg-slate-900/10 text-slate-300 last:border-0">
                            <td className="py-3.5 px-4 font-medium text-slate-400">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={cn(
                                "font-extrabold uppercase text-[9px] px-2 py-0.5 rounded border tracking-wider",
                                log.status === "success"
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                              )}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-200">
                              {log.recordsSynced} records
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono">
                              {log.durationMs}ms
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 truncate max-w-xs font-mono">
                              {log.errorMessage || "Audit status: clean sync success."}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
