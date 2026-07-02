"use client";

import { useEffect, useState } from "react";
import { 
  Database, 
  Server, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Clock, 
  Activity, 
  Plus, 
  Layers, 
  Trash2 
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
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

export function DatabaseManagerView() {
  const companyId = useHrCompanyId();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "add" | "logs">("list");
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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
        message: res.data.message || "Connection successful!"
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || "Failed to establish connection."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!connectionUrl && (!host || !databaseName || !username))) {
      alert("Please fill all required connection fields.");
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
      // Reset form
      setName("");
      setPassword("");
      setConnectionUrl("");
      setTestResult(null);
      setActiveTab("list");
      fetchConnections();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    setLoading(true);
    try {
      await apiClient.post(`/database-connections/${id}/role`, { role });
      fetchConnections();
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
      alert(res.data.message || "Backup synchronization completed successfully!");
      fetchSyncLogs();
      fetchConnections();
    } catch (err: any) {
      alert(err.response?.data?.error || "Backup synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Database className="h-6 w-6 text-indigo-500" />
          Database Manager
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Connect and configure your primary workspace database and automated backup schedules.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab("list")}
          className={cn(
            "pb-3 text-sm font-semibold transition-all border-b-2",
            activeTab === "list"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          Connections
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={cn(
            "pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5",
            activeTab === "add"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Plus className="h-4 w-4" /> Add Connection
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={cn(
            "pb-3 text-sm font-semibold transition-all border-b-2",
            activeTab === "logs"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          Sync History & Logs
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tab 1: Connection List */}
        {activeTab === "list" && (
          <>
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Connection profiles
              </h2>
              {connections.length === 0 ? (
                <div className="p-6 text-center border border-slate-800 rounded-xl bg-slate-900/20 text-slate-500 text-sm">
                  No database connections found. Add one to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((conn) => (
                    <div
                      key={conn.id}
                      onClick={() => setSelectedConnection(conn)}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3",
                        selectedConnection?.id === conn.id
                          ? "border-indigo-500/50 bg-indigo-500/5"
                          : "border-slate-800 bg-slate-900/10 hover:border-slate-700"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm",
                          conn.type === "mysql" && "bg-cyan-500/15 text-cyan-400",
                          conn.type === "mongodb" && "bg-emerald-500/15 text-emerald-400",
                          conn.type === "postgresql" && "bg-indigo-500/15 text-indigo-400"
                        )}
                      >
                        {conn.type.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200 text-sm truncate block">
                            {conn.name}
                          </span>
                          {conn.role !== "none" && (
                            <span
                              className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                conn.role === "primary"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                  : "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
                              )}
                            >
                              {conn.role}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {conn.host}:{conn.port} • {conn.databaseName}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          conn.status === "connected" && "bg-emerald-500 shadow-lg shadow-emerald-500/50",
                          conn.status === "disconnected" && "bg-slate-600",
                          conn.status === "error" && "bg-rose-500 shadow-lg shadow-rose-500/50"
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Connection Panel */}
            <div className="lg:col-span-2">
              {selectedConnection ? (
                <div className="border border-slate-800 rounded-2xl bg-slate-900/10 p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        {selectedConnection.name}
                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-slate-300 uppercase">
                          {selectedConnection.type}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">ID: {selectedConnection.id}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateRole(selectedConnection.id, "primary")}
                        disabled={selectedConnection.role === "primary" || loading}
                        className={cn(
                          "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all",
                          selectedConnection.role === "primary"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                        )}
                      >
                        Set Primary
                      </button>
                      <button
                        onClick={() => handleUpdateRole(selectedConnection.id, "backup")}
                        disabled={selectedConnection.role === "backup" || loading}
                        className={cn(
                          "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all",
                          selectedConnection.role === "backup"
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 cursor-default"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                        )}
                      >
                        Set Backup
                      </button>
                    </div>
                  </div>

                  {/* Config details */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs">Host Address</span>
                      <span className="font-medium text-slate-300">{selectedConnection.host}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs">Port</span>
                      <span className="font-medium text-slate-300">{selectedConnection.port}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs">Database Name</span>
                      <span className="font-medium text-slate-300">{selectedConnection.databaseName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs">Role Assignment</span>
                      <span className="font-medium text-slate-300 capitalize">{selectedConnection.role}</span>
                    </div>
                  </div>

                  {/* Sync Settings if Backup */}
                  {selectedConnection.role === "backup" && (
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-400" />
                        <h4 className="font-semibold text-slate-200 text-sm">Backup Synchronization</h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        This connection is configured to receive automated operational backups (CRM, HR, Accounting) from the Primary database.
                      </p>
                      <div className="flex justify-between items-center text-xs pt-2">
                        <span className="text-slate-500">Schedule: <strong className="text-slate-300">{selectedConnection.syncSchedule || "None"}</strong></span>
                        <button
                          onClick={() => handleTriggerSync(selectedConnection.id)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
                        >
                          <Play className="h-3 w-3" /> Sync Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full border border-dashed border-slate-800 rounded-2xl flex flex-col justify-center items-center p-12 text-slate-500">
                  <Server className="h-10 w-10 text-slate-700 mb-3" />
                  <span className="text-sm font-medium">Select a connection to view details & set roles</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab 2: Add Connection Form */}
        {activeTab === "add" && (
          <div className="lg:col-span-3 border border-slate-800 rounded-2xl bg-slate-900/10 p-6 max-w-3xl mx-auto w-full">
            <h2 className="text-base font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-500" /> Register Database Connection
            </h2>

            <form onSubmit={handleSaveConnection} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-slate-400 block">Connection Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Production CRM Server"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 block">Database Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mongodb">MongoDB</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 block">Host Name *</label>
                  <input
                    type="text"
                    required
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="127.0.0.1"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 block">Port *</label>
                  <input
                    type="number"
                    required
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 block">Database Name *</label>
                  <input
                    type="text"
                    required
                    value={databaseName}
                    onChange={(e) => setDatabaseName(e.target.value)}
                    placeholder="rivexa_crm"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 block">Username *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="root"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 block">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-slate-400 block">Connection URL (Optional Override)</label>
                  <input
                    type="text"
                    value={connectionUrl}
                    onChange={(e) => setConnectionUrl(e.target.value)}
                    placeholder="mysql://user:pass@host:3306/db"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ssl"
                  checked={sslEnabled}
                  onChange={(e) => setSslEnabled(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0 h-4 w-4"
                />
                <label htmlFor="ssl" className="text-xs font-semibold text-slate-400 cursor-pointer select-none">
                  Enable SSL Mode
                </label>
              </div>

              {testResult && (
                <div
                  className={cn(
                    "p-4 rounded-xl border flex items-start gap-2.5 text-xs",
                    testResult.success
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  )}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-bold block mb-0.5">
                      {testResult.success ? "Connection success" : "Connection failed"}
                    </span>
                    <span>{testResult.message}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={loading}
                  className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-slate-100 font-semibold text-sm rounded-xl transition-all"
                >
                  Test Connection
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all"
                >
                  Save Connection
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Sync Logs */}
        {activeTab === "logs" && (
          <div className="lg:col-span-3 border border-slate-800 rounded-2xl bg-slate-900/10 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" /> Synchronization Log History
            </h2>

            {syncLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm border border-slate-800 border-dashed rounded-xl">
                No synchronization operations recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4 font-semibold">Timestamp</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Synced Count</th>
                      <th className="py-3 px-4 font-semibold">Duration</th>
                      <th className="py-3 px-4 font-semibold">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-900 hover:bg-slate-900/5 text-slate-300">
                        <td className="py-3 px-4 font-medium text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "font-bold uppercase text-[9px] px-2 py-0.5 rounded border",
                              log.status === "success"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            )}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {log.recordsSynced} records
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {log.durationMs}ms
                        </td>
                        <td className="py-3 px-4 text-slate-500 truncate max-w-xs">
                          {log.errorMessage || "Completed successfully"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
