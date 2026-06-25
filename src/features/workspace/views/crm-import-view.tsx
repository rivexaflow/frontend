"use client";

import { useState, useRef, useEffect } from "react";
import { 
  AlertCircle, Download, FileSpreadsheet, Upload, Database, ArrowRight, CheckCircle2, 
  Loader2, Plus, RefreshCw, Server, Table, FileJson, Columns, Check, ChevronRight, Play, Info, Sparkles, ShieldCheck
} from "lucide-react";

import { CrmNotice, CrmPanel, CrmPanelBody, CrmPanelHead } from "@/features/workspace/components/crm/crm-panel";
import { CrmGhostButton, CrmPrimaryButton } from "@/features/workspace/components/crm/crm-ui-primitives";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

// Interface for target systems available for mapping
interface TargetField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  desc?: string;
}

interface EntitySchema {
  name: string;
  label: string;
  fields: TargetField[];
}

// target mapping schema definition
const TARGET_SCHEMAS: Record<string, EntitySchema> = {
  User: {
    name: "User",
    label: "Workspace Users",
    fields: [
      { key: "email", label: "Email Address", type: "string", required: true, desc: "Unique email used for login" },
      { key: "username", label: "Username", type: "string", required: false, desc: "Unique handle for mentions" },
      { key: "fullName", label: "Full Name", type: "string", required: false, desc: "First and last name" },
      { key: "phone", label: "Phone Number", type: "string", required: false },
      { key: "role", label: "System Role", type: "string", required: false, desc: "Default is MEMBER. Options: ADMIN, MEMBER" },
      { key: "password", label: "Temporary Password", type: "string", required: false, desc: "Credentials for legacy user migration" }
    ]
  },
  CompanyDepartment: {
    name: "CompanyDepartment",
    label: "Company Departments",
    fields: [
      { key: "name", label: "Department Name", type: "string", required: true, desc: "e.g. Sales, Support, Engineering" },
      { key: "id", label: "Source Primary Key", type: "string", required: false, desc: "Used to connect teams and leads" }
    ]
  },
  CompanyTeam: {
    name: "CompanyTeam",
    label: "Company Teams",
    fields: [
      { key: "name", label: "Team Name", type: "string", required: true, desc: "e.g. Inbound Sales, Outbound Leads" },
      { key: "departmentId", label: "Department ID Ref", type: "string", required: true, desc: "Connects this team to a department" },
      { key: "id", label: "Source Primary Key", type: "string", required: false }
    ]
  },
  CrmLead: {
    name: "CrmLead",
    label: "CRM Leads",
    fields: [
      { key: "name", label: "Lead Name", type: "string", required: true, desc: "Lead or contact full name" },
      { key: "email", label: "Email Address", type: "string", required: false },
      { key: "phone", label: "Phone Number", type: "string", required: false },
      { key: "companyName", label: "Company Name", type: "string", required: false },
      { key: "source", label: "Lead Source", type: "string", required: false, desc: "e.g. website, referral, social" },
      { key: "stage", label: "Pipeline Stage", type: "string", required: false, desc: "e.g. new, contacted, qualified" },
      { key: "value", label: "Deal Value", type: "number", required: false, desc: "Estimated value in system currency" },
      { key: "priority", label: "Priority", type: "string", required: false, desc: "low, medium, high, urgent" },
      { key: "notes", label: "Notes/Description", type: "string", required: false, desc: "Text description of the deal" },
      { key: "assignedTo", label: "Assigned User ID Ref", type: "string", required: false, desc: "Maps to legacy user ID to associate owner" },
      { key: "departmentId", label: "Department ID Ref", type: "string", required: false, desc: "Associates lead to department" },
      { key: "id", label: "Source Primary Key", type: "string", required: false }
    ]
  },
  CrmActivity: {
    name: "CrmActivity",
    label: "CRM Activities & Notes",
    fields: [
      { key: "title", label: "Activity Title", type: "string", required: true, desc: "e.g. Follow-up Email, Cold Call" },
      { key: "type", label: "Activity Type", type: "string", required: true, desc: "call, email, meeting, note, task" },
      { key: "notes", label: "Activity Notes", type: "string", required: false },
      { key: "status", label: "Status", type: "string", required: false, desc: "pending, completed" },
      { key: "leadId", label: "CRM Lead ID Ref", type: "string", required: true, desc: "Connects activity to parent Lead" }
    ]
  }
};

type Step = 1 | 2 | 3 | 4 | 5;
type SourceType = "file" | "db" | null;

export function CrmImportView() {
  const { workspaceId, workspaceName } = useCurrentWorkspace();
  
  // Navigation & Wizard State
  const [step, setStep] = useState<Step>(1);
  const [sourceType, setSourceType] = useState<SourceType>(null);
  const [error, setError] = useState<string | null>(null);
  
  // File upload state
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DB connection form state
  const [dbType, setDbType] = useState<"mysql" | "postgres" | "mongodb">("mysql");
  const [dbHost, setDbHost] = useState("");
  const [dbPort, setDbPort] = useState("");
  const [dbName, setDbName] = useState("");
  const [dbUser, setDbUser] = useState("");
  const [dbPass, setDbPass] = useState("");
  const [dbSsl, setDbSsl] = useState(false);
  const [dbTesting, setDbTesting] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Schema state loaded from source (Unified)
  const [discoveredTables, setDiscoveredTables] = useState<Record<string, { recordCount: number; columns: string[] }>>({});
  const [rawData, setRawData] = useState<Record<string, any[]>>({});

  // Step 2: Entity mapping state (e.g. legacy_users -> "User", legacy_crm_leads -> "CrmLead")
  const [entityMappings, setEntityMappings] = useState<Record<string, string>>({});

  // Step 3: Column/Field mapping state
  // Schema: { [tableName]: { mappings: { [targetKey]: sourceColumn }, customFields: string[] } }
  const [fieldMappings, setFieldMappings] = useState<Record<string, { mappings: Record<string, string>; customFields: string[] }>>({});

  // Step 4: Execution Progress Logs
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Step 5: Success Results
  const [importSummary, setImportSummary] = useState<Record<string, number>>({});
  const [mappingsResolved, setMappingsResolved] = useState(0);

  // Auto-scroll logs terminal
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [progressLogs]);

  // Unified resets
  const handleReset = () => {
    setStep(1);
    setSourceType(null);
    setError(null);
    setFileName(null);
    setDbConnected(false);
    setDiscoveredTables({});
    setRawData({});
    setEntityMappings({});
    setFieldMappings({});
    setProgressLogs([]);
    setProgressPercent(0);
    setIsExecuting(false);
  };

  // Quick Demo Autofill helper
  const handleQuickDemoFill = () => {
    setDbType("mysql");
    setDbHost("legacy-db.internal.production");
    setDbPort("3306");
    setDbName("corporate_legacy_system");
    setDbUser("rivexa_import_service");
    setDbPass("••••••••••••••••");
    setDbSsl(true);
    setError(null);
  };

  // Test DB connection and pull schema
  const handleDbConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbHost || !dbName || !dbUser) {
      setError("Please fill in host, database name, and username.");
      return;
    }
    setError(null);
    setDbTesting(true);
    setDbConnected(false);

    try {
      const res = await apiClient.post(`/migration/${workspaceId}/db-test`, {
        type: dbType,
        host: dbHost,
        port: dbPort || undefined,
        database: dbName,
        username: dbUser,
        password: dbPass,
        ssl: dbSsl
      });

      if (res.data.success) {
        setDbConnected(true);
        setDiscoveredTables(res.data.tables);
        setRawData(res.data.rawData);
        
        // Auto-detect Entity Mapping logic
        const initialEntityMap: Record<string, string> = {};
        Object.keys(res.data.tables).forEach(table => {
          const tLower = table.toLowerCase();
          if (tLower.includes("user") || tLower.includes("employee") || tLower.includes("member")) {
            initialEntityMap[table] = "User";
          } else if (tLower.includes("lead") || tLower.includes("deal") || tLower.includes("crm")) {
            initialEntityMap[table] = "CrmLead";
          } else if (tLower.includes("activity") || tLower.includes("note") || tLower.includes("task")) {
            initialEntityMap[table] = "CrmActivity";
          } else if (tLower.includes("department") || tLower.includes("dept")) {
            initialEntityMap[table] = "CompanyDepartment";
          } else if (tLower.includes("team") || tLower.includes("group")) {
            initialEntityMap[table] = "CompanyTeam";
          } else {
            initialEntityMap[table] = "SKIP";
          }
        });
        setEntityMappings(initialEntityMap);

        // Pre-configure field mappings
        initializeFieldMappings(res.data.tables, initialEntityMap);

        // Advance to Step 2
        setStep(2);
      } else {
        setError(res.data.error || "Connection failed.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Failed to establish database connection.");
    } finally {
      setDbTesting(false);
    }
  };

  // Upload file analysis
  const handleFileUpload = async (file: File) => {
    setError(null);
    setFileName(file.name);
    setFileLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiClient.post(`/migration/${workspaceId}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setDiscoveredTables(res.data.summary);
        setRawData(res.data.rawData);

        // Auto-detect entity map (default is Lead for file)
        const initialEntityMap: Record<string, string> = {};
        Object.keys(res.data.summary).forEach(table => {
          initialEntityMap[table] = "CrmLead";
        });
        setEntityMappings(initialEntityMap);

        // Pre-configure field mappings
        initializeFieldMappings(res.data.summary, initialEntityMap);

        // Advance to Step 2
        setStep(2);
      } else {
        setError(res.data.error || "Analysis failed.");
        setFileName(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Error parsing file.");
      setFileName(null);
    } finally {
      setFileLoading(false);
    }
  };

  // Helper to pre-fill smart column mappings on load
  const initializeFieldMappings = (
    tables: Record<string, { columns: string[] }>, 
    mappings: Record<string, string>
  ) => {
    const newFieldMap: Record<string, { mappings: Record<string, string>; customFields: string[] }> = {};

    Object.keys(tables).forEach(table => {
      const targetEntity = mappings[table];
      const cols = tables[table].columns;

      const singleMap: Record<string, string> = {};
      const customCols: string[] = [];

      if (targetEntity && targetEntity !== "SKIP" && TARGET_SCHEMAS[targetEntity]) {
        TARGET_SCHEMAS[targetEntity].fields.forEach(field => {
          // Find matching key/name in source columns
          const match = cols.find(c => {
            const cLower = c.toLowerCase().replace(/[^a-z0-9]/g, "");
            const fLower = field.key.toLowerCase().replace(/[^a-z0-9]/g, "");
            const labelLower = field.label.toLowerCase().replace(/[^a-z0-9]/g, "");
            return cLower === fLower || cLower.includes(fLower) || fLower.includes(cLower) || cLower.includes(labelLower);
          });
          if (match) {
            singleMap[field.key] = match;
          }
        });
      }

      newFieldMap[table] = {
        mappings: singleMap,
        customFields: customCols
      };
    });

    setFieldMappings(newFieldMap);
  };

  // Triggered when an entity type changes in Step 2
  const handleEntityChange = (table: string, entity: string) => {
    const updated = { ...entityMappings, [table]: entity };
    setEntityMappings(updated);

    // Reinitialize field map for this table
    const cols = discoveredTables[table].columns;
    const singleMap: Record<string, string> = {};
    
    if (entity !== "SKIP" && TARGET_SCHEMAS[entity]) {
      TARGET_SCHEMAS[entity].fields.forEach(field => {
        const match = cols.find(c => {
          const cLower = c.toLowerCase().replace(/[^a-z0-9]/g, "");
          const fLower = field.key.toLowerCase().replace(/[^a-z0-9]/g, "");
          return cLower === fLower || cLower.includes(fLower) || fLower.includes(cLower);
        });
        if (match) singleMap[field.key] = match;
      });
    }

    setFieldMappings({
      ...fieldMappings,
      [table]: { mappings: singleMap, customFields: [] }
    });
  };

  // Update specific field map column selection
  const handleFieldMapChange = (table: string, targetKey: string, sourceCol: string) => {
    const current = fieldMappings[table] || { mappings: {}, customFields: [] };
    const updatedMappings = { ...current.mappings, [targetKey]: sourceCol };
    
    setFieldMappings({
      ...fieldMappings,
      [table]: { ...current, mappings: updatedMappings }
    });
  };

  // Toggle dynamic custom field selection
  const handleCustomFieldToggle = (table: string, col: string) => {
    const current = fieldMappings[table] || { mappings: {}, customFields: [] };
    let updatedCustom = [...current.customFields];
    if (updatedCustom.includes(col)) {
      updatedCustom = updatedCustom.filter(c => c !== col);
    } else {
      updatedCustom.push(col);
    }

    setFieldMappings({
      ...fieldMappings,
      [table]: { ...current, customFields: updatedCustom }
    });
  };

  // Run data ingestion execution with simulated log visualizer
  const executeImport = async () => {
    setStep(4);
    setIsExecuting(true);
    setProgressPercent(5);
    setProgressLogs(["[00:01] ⚡ Booting Rivexa Flow Core Migration Engine...", "[00:02] [CONFIG] Preparing white-label isolation context..."]);

    const timeString = () => `[${new Date().toLocaleTimeString()}]`;

    // Progressive logging timeline simulator
    const logInterval = (text: string, delay: number, percent: number) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setProgressPercent(percent);
          setProgressLogs(prev => [...prev, `${timeString()} ${text}`]);
          resolve();
        }, delay);
      });
    };

    try {
      // Send backend API import call in background
      const importPromise = apiClient.post(`/migration/${workspaceId}/import`, {
        rawData,
        entityMappings,
        fieldMappings
      });

      await logInterval("[INFO] Analyzing column definitions and matching data formats...", 600, 15);
      await logInterval("[INFO] Testing security credentials & tenant isolation compliance...", 800, 25);
      
      const isUserImport = Object.values(entityMappings).includes("User");
      const isDeptImport = Object.values(entityMappings).includes("CompanyDepartment");
      const isLeadImport = Object.values(entityMappings).includes("CrmLead");
      
      if (isUserImport) {
        await logInterval("[USER] Verifying registered user conflicts. Compiling password cryptographic hashes...", 900, 38);
        await logInterval("[USER] Registering new corporate company memberships and privileges...", 500, 45);
      }
      
      if (isDeptImport) {
        await logInterval("[DEPT] Rebuilding organizational structure. Assigning workspace scopes...", 700, 58);
      }

      if (isLeadImport) {
        await logInterval("[LEAD] Initializing bulk database transactions. Processing data chunks...", 900, 72);
        
        // Check if there are custom fields
        const totalCustom = Object.values(fieldMappings).reduce((acc, current) => acc + current.customFields.length, 0);
        if (totalCustom > 0) {
          await logInterval(`[CUSTOM] Detected ${totalCustom} custom columns. Initializing custom_fields registration...`, 800, 80);
        }
      }

      await logInterval("[CONNECT] Linking parent associations and reference primary keys...", 600, 88);

      // Await real backend response
      const res = await importPromise;

      if (res.data.success) {
        setProgressPercent(100);
        setProgressLogs(prev => [
          ...prev, 
          `${timeString()} [SUCCESS] Database transaction committed successfully.`,
          `${timeString()} [SUCCESS] ${res.data.mappingsResolved || 0} entity references resolved.`,
          `${timeString()} [SUCCESS] Import process finished.`
        ]);
        
        setImportSummary(res.data.summary);
        setMappingsResolved(res.data.mappingsResolved);
        
        // Delay transition to success dashboard for feedback
        setTimeout(() => {
          setStep(5);
          setIsExecuting(false);
        }, 1200);
      } else {
        throw new Error(res.data.error || "Failed importing data.");
      }
    } catch (err: any) {
      setIsExecuting(false);
      setProgressLogs(prev => [
        ...prev, 
        `${timeString()} [CRITICAL ERROR] Transaction rollbacked. Ingestion halted.`,
        `[REASON] ${err?.response?.data?.error || err.message || "Unknown schema mismatch error."}`
      ]);
      setError(err?.response?.data?.error || err.message || "Ingestion mapping failure.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl pb-16">
      <CrmPageHeader
        metrics={[
          { label: "Selected workspace", value: workspaceName || "Default" },
          { label: "Target entities", value: "5 systems" },
        ]}
        actions={
          step > 1 ? (
            <CrmGhostButton onClick={handleReset}>
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Reset wizard
            </CrmGhostButton>
          ) : undefined
        }
      />

      {/* Modern Horizontal Step Progress Tracker */}
      <div className="mb-8 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/40">
        {[
          { num: 1, label: "Select Source" },
          { num: 2, label: "Map Entities" },
          { num: 3, label: "Map Fields" },
          { num: 4, label: "Execute Import" },
          { num: 5, label: "Stats Dashboard" }
        ].map((s, idx) => (
          <div key={s.num} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all shadow-sm",
                step === s.num 
                  ? "bg-[#191970] text-white ring-4 ring-[#191970]/10 scale-105" 
                  : step > s.num 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              )}>
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className={cn(
                "hidden text-sm font-semibold md:inline transition-colors",
                step === s.num 
                  ? "text-slate-900 dark:text-white" 
                  : step > s.num 
                    ? "text-emerald-700 dark:text-emerald-500" 
                    : "text-slate-400"
              )}>
                {s.label}
              </span>
            </div>
            {idx < 4 && (
              <div className={cn(
                "mx-4 h-0.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-800",
                step > s.num ? "bg-emerald-500" : ""
              )} />
            )}
          </div>
        ))}
      </div>

      {error && step !== 4 && (
        <div className="mb-6">
          <CrmNotice tone="warning">
            <div className="flex gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <h4 className="font-bold text-amber-900 dark:text-amber-300">Action Required</h4>
                <p className="text-sm text-amber-800 dark:text-amber-400/90">{error}</p>
              </div>
            </div>
          </CrmNotice>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          STEP 1: SELECT SOURCE & CONFIGURE
          ──────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card A: File Ingestion */}
          <div className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] dark:border-slate-800/80 dark:bg-slate-950/40">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                <Upload className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Upload Legacy Files</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Import relational tables from SQL, CSV, or JSON schema files.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-1 flex-col justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/30 p-8 text-center transition hover:border-violet-500/40 hover:bg-violet-50/10 dark:border-slate-800 dark:bg-slate-900/10">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600" />
              <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Drag & drop your file here</p>
              <p className="text-xs text-slate-400 mt-1">Supports SQL dump files, CSV spreadsheets, and structured JSON (max 5 MB)</p>
              
              <CrmPrimaryButton 
                type="button" 
                className="mx-auto mt-6"
                disabled={fileLoading}
                onClick={() => fileInputRef.current?.click()}
              >
                {fileLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                Browse Files
              </CrmPrimaryButton>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv,.sql,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </div>
            
            <div className="mt-6 flex items-center justify-between text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded-xl">
              <span className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
                <Info className="h-3.5 w-3.5" />
                Want a reference structure?
              </span>
              <a href="#" className="font-semibold text-violet-600 hover:underline flex items-center gap-0.5 dark:text-violet-400">
                Download Sample CSV
                <Download className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Card B: Database Connection */}
          <div className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] dark:border-slate-800/80 dark:bg-slate-950/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <Database className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Live Database Connector</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Connect and ingest tables from an external SQL server.</p>
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={handleQuickDemoFill}
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100 transition dark:bg-amber-950/30 dark:text-amber-400"
              >
                <Sparkles className="h-3 w-3 animate-pulse" />
                Demo DB
              </button>
            </div>

            <form onSubmit={handleDbConnect} className="mt-8 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {(["mysql", "postgres", "mongodb"] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDbType(type)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border p-3.5 text-xs font-semibold capitalize transition",
                      dbType === type 
                        ? "border-[#191970] bg-[#191970]/5 text-[#191970] dark:border-indigo-500 dark:bg-indigo-950/20 dark:text-indigo-400" 
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
                    )}
                  >
                    <Server className="h-4 w-4 mb-1.5 opacity-80" />
                    {type === "postgres" ? "PostgreSQL" : type === "mysql" ? "MySQL / Maria" : "MongoDB"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Host Address</label>
                  <input
                    type="text"
                    value={dbHost}
                    onChange={(e) => setDbHost(e.target.value)}
                    placeholder="db.example.com or IP"
                    className={cn(crm.input, "w-full mt-1")}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Port</label>
                  <input
                    type="text"
                    value={dbPort}
                    onChange={(e) => setDbPort(e.target.value)}
                    placeholder={dbType === "postgres" ? "5432" : dbType === "mysql" ? "3306" : "27017"}
                    className={cn(crm.input, "w-full mt-1")}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Database Name</label>
                <input
                  type="text"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="e.g. corporate_crm_backup"
                  className={cn(crm.input, "w-full mt-1")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Username</label>
                  <input
                    type="text"
                    value={dbUser}
                    onChange={(e) => setDbUser(e.target.value)}
                    placeholder="db_read_user"
                    className={cn(crm.input, "w-full mt-1")}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Password</label>
                  <input
                    type="password"
                    value={dbPass}
                    onChange={(e) => setDbPass(e.target.value)}
                    placeholder="••••••••••••"
                    className={cn(crm.input, "w-full mt-1")}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={dbSsl}
                    onChange={(e) => setDbSsl(e.target.checked)}
                    className="rounded border-slate-300 text-[#191970] focus:ring-[#191970]/20"
                  />
                  Secure connection (SSL / TLS enforced)
                </label>

                <CrmPrimaryButton 
                  type="submit" 
                  disabled={dbTesting}
                  className="px-6"
                >
                  {dbTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing connection...
                    </>
                  ) : (
                    <>
                      Test & Connect
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </CrmPrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          STEP 2: MAP TABLES TO SYSTEM ENTITIES
          ──────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <CrmPanel>
          <CrmPanelHead
            title="Step 2 · Map Relational Tables to Rivexa Schemas"
            subtitle="Match source database tables or file outputs to destination structures."
            accent
          />
          <CrmPanelBody className="space-y-6">
            <div className="rounded-xl border border-blue-50 bg-blue-50/50 p-4 text-sm text-blue-900 dark:border-blue-950/40 dark:bg-blue-950/20 dark:text-blue-300">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-blue-950 dark:text-blue-200">
                <Info className="h-4 w-4 shrink-0" />
                Schema Matching Recommendation
              </span>
              Verify mapped entity schemas. Discovered tables with mismatched targets should be set to <strong>Skip</strong> to ignore them during database ingestion.
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Source Table</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Rows</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Available Columns</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Rivexa Target Model</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950/20">
                  {Object.keys(discoveredTables).map(table => (
                    <tr key={table} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Table className="h-4 w-4 text-slate-400" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{table}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {discoveredTables[table].recordCount} rows
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {discoveredTables[table].columns.map(col => (
                            <span key={col} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {col}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <select
                          value={entityMappings[table] || "SKIP"}
                          onChange={(e) => handleEntityChange(table, e.target.value)}
                          className={cn(crm.select, "w-60 h-9 font-semibold text-slate-800 dark:text-slate-100")}
                        >
                          <option value="SKIP">⚠️ Skip (Do not import)</option>
                          <option value="User">👥 Workspace Users (User)</option>
                          <option value="CompanyDepartment">🏢 Company Departments (CompanyDepartment)</option>
                          <option value="CompanyTeam">🛡️ Company Teams (CompanyTeam)</option>
                          <option value="CrmLead">🎯 CRM Leads (CrmLead)</option>
                          <option value="CrmActivity">📋 CRM Activities (CrmActivity)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <CrmGhostButton onClick={handleReset}>Back</CrmGhostButton>
              <CrmPrimaryButton 
                onClick={() => setStep(3)}
                disabled={!Object.values(entityMappings).some(m => m !== "SKIP")}
              >
                Configure Column Fields
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </CrmPrimaryButton>
            </div>
          </CrmPanelBody>
        </CrmPanel>
      )}

      {/* ────────────────────────────────────────────────────────────
          STEP 3: GRANULAR COLUMN FIELD MAPPING
          ──────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Step 3 · Map Source Schema Columns to Targets</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Match the database columns from your data source to the required fields inside Rivexa.</p>
            </div>
            
            <div className="flex gap-2">
              <CrmGhostButton onClick={() => setStep(2)}>Back</CrmGhostButton>
              <CrmPrimaryButton onClick={executeImport}>
                <Play className="mr-1.5 h-4 w-4 fill-current" />
                Initialize Ingestion
              </CrmPrimaryButton>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-6">
              {Object.keys(discoveredTables)
                .filter(table => entityMappings[table] && entityMappings[table] !== "SKIP")
                .map(table => {
                  const targetEntity = entityMappings[table];
                  const schema = TARGET_SCHEMAS[targetEntity];
                  const sourceCols = discoveredTables[table].columns;
                  const mapped = fieldMappings[table] || { mappings: {}, customFields: [] };

                  if (!schema) return null;

                  return (
                    <CrmPanel key={table}>
                      <CrmPanelHead
                        title={`${table} ➔ Mapping to ${schema.label}`}
                        subtitle={`Configure database mapping for ${discoveredTables[table].recordCount} legacy records.`}
                        accent
                      />
                      <CrmPanelBody className="space-y-4">
                        <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                            <thead className="bg-slate-50/80 dark:bg-slate-900/50">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Rivexa Schema Field</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Data Type</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Source Column</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950/20">
                              {schema.fields.map(field => {
                                const activeSourceCol = mapped.mappings[field.key] || "";
                                return (
                                  <tr key={field.key} className="hover:bg-slate-50/20">
                                    <td className="px-4 py-3">
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{field.label}</span>
                                          {field.required && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-1 py-0.5 rounded">
                                              Required
                                            </span>
                                          )}
                                        </div>
                                        {field.desc && (
                                          <span className="text-xs text-slate-400 mt-0.5 block">{field.desc}</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                                      {field.type}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                      <select
                                        value={activeSourceCol}
                                        onChange={(e) => handleFieldMapChange(table, field.key, e.target.value)}
                                        className={cn(crm.select, "w-full max-w-xs font-semibold", 
                                          field.required && !activeSourceCol ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : ""
                                        )}
                                      >
                                        <option value="">-- Leave Unmapped / Null --</option>
                                        {sourceCols.map(col => (
                                          <option key={col} value={col}>
                                            📂 {col}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Custom Fields configuration section (Dynamic Import) */}
                        {targetEntity === "CrmLead" && (
                          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                            <h4 className="flex items-center gap-1 text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                              <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                              Custom Workspace Fields
                            </h4>
                            <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">
                              Discovered source columns not mapped above can be automatically registered as custom workspace fields. Select the columns to import:
                            </p>

                            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                              {sourceCols
                                .filter(col => !Object.values(mapped.mappings).includes(col))
                                .map(col => {
                                  const isChecked = mapped.customFields.includes(col);
                                  return (
                                    <button
                                      key={col}
                                      type="button"
                                      onClick={() => handleCustomFieldToggle(table, col)}
                                      className={cn(
                                        "flex items-center justify-between rounded-lg border p-2 text-left text-xs font-semibold transition-all shadow-sm",
                                        isChecked 
                                          ? "border-violet-600 bg-violet-600/5 text-violet-700 dark:border-violet-400 dark:text-violet-300"
                                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                                      )}
                                    >
                                      <span className="truncate pr-1">{col}</span>
                                      {isChecked ? (
                                        <Check className="h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-400" />
                                      ) : (
                                        <Plus className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                      )}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </CrmPanelBody>
                    </CrmPanel>
                  );
                })}
            </div>

            {/* Validation Panel */}
            <div className="space-y-6">
              <CrmPanel>
                <CrmPanelHead title="Schema Validation Status" subtitle="Check required mapping configurations" />
                <CrmPanelBody className="space-y-4">
                  <div className="space-y-3">
                    {Object.keys(discoveredTables)
                      .filter(table => entityMappings[table] && entityMappings[table] !== "SKIP")
                      .map(table => {
                        const entity = entityMappings[table];
                        const schema = TARGET_SCHEMAS[entity];
                        const mapped = fieldMappings[table] || { mappings: {}, customFields: [] };
                        
                        // Check missing required fields
                        const missing = schema.fields
                          .filter(f => f.required && !mapped.mappings[f.key])
                          .map(f => f.label);

                        const isValid = missing.length === 0;

                        return (
                          <div key={table} className="flex items-start justify-between rounded-xl border border-slate-100 p-3.5 dark:border-slate-800/80">
                            <div className="space-y-1">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">{table}</span>
                              <span className="text-xs text-slate-400 block">Mapping: {schema.label}</span>
                              {!isValid && (
                                <span className="text-xs text-rose-500 font-medium block mt-1">
                                  Missing required: {missing.join(", ")}
                                </span>
                              )}
                            </div>
                            <div>
                              {isValid ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                  <Check className="h-3 w-3" />
                                  Validated
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                                  <AlertCircle className="h-3 w-3" />
                                  Invalid
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="border-t border-slate-100 pt-4 dark:border-slate-800/80">
                    <p className="text-xs text-slate-500 flex gap-2 dark:text-slate-400">
                      <ShieldCheck className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                      Ingestion performs dry-run validation. Relational key mapping automatically chains child IDs across rows dynamically.
                    </p>
                  </div>
                </CrmPanelBody>
              </CrmPanel>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          STEP 4: LIVE INGESTION EXECUTION CONSOLE
          ──────────────────────────────────────────────────────────── */}
      {step === 4 && (
        <CrmPanel className="overflow-hidden">
          <CrmPanelHead
            title="Import Execution Console"
            subtitle="Processing database transactions in secure memory buffer."
            accent
          />
          <CrmPanelBody className="space-y-6">
            <div className="relative">
              {/* Progress visual bar */}
              <div className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span className="flex items-center gap-2">
                  {isExecuting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#191970] dark:text-indigo-400" />
                  ) : null}
                  {isExecuting ? "Ingesting records..." : "Halted"}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-[#191970] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Immersive Dark Mode Terminal logs */}
            <div 
              ref={logContainerRef}
              className="h-96 w-full overflow-y-auto rounded-2xl bg-[#090b11] p-6 font-mono text-xs text-slate-300 shadow-inner border border-slate-900 leading-relaxed"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                <span>Ingestion Terminal v1.4</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Syncing
                </span>
              </div>
              
              <div className="space-y-2">
                {progressLogs.map((log, idx) => {
                  let color = "text-slate-300";
                  if (log.includes("[SUCCESS]")) color = "text-emerald-400";
                  if (log.includes("[USER]")) color = "text-blue-400";
                  if (log.includes("[DEPT]")) color = "text-pink-400";
                  if (log.includes("[LEAD]")) color = "text-violet-400";
                  if (log.includes("[CUSTOM]")) color = "text-amber-400";
                  if (log.includes("[CRITICAL ERROR]")) color = "text-rose-500 font-bold";
                  if (log.includes("[REASON]")) color = "text-rose-400";

                  return (
                    <div key={idx} className={color}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>

            {!isExecuting && error && (
              <div className="flex gap-2">
                <CrmGhostButton onClick={() => setStep(3)} className="flex-1 justify-center">
                  Back to field mapping
                </CrmGhostButton>
                <CrmPrimaryButton onClick={handleReset} className="flex-1 justify-center bg-rose-600 hover:bg-rose-700">
                  Abort & Clear
                </CrmPrimaryButton>
              </div>
            )}
          </CrmPanelBody>
        </CrmPanel>
      )}

      {/* ────────────────────────────────────────────────────────────
          STEP 5: INGESTION SUCCESS STATS DASHBOARD
          ──────────────────────────────────────────────────────────── */}
      {step === 5 && (
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900/60">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Legacy Data Migrated Successfully!</h2>
            <p className="text-slate-500 text-sm dark:text-slate-400">
              The migration engine completed transactional schema ingestion for <strong>{workspaceName}</strong>. Relational dependencies and key constraints resolved.
            </p>
          </div>

          {/* Stats Ingestion Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Workspace Users Ingested", value: importSummary.User || 0, icon: Columns, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400" },
              { label: "Departments Created", value: importSummary.CompanyDepartment || 0, icon: Server, color: "text-pink-600 bg-pink-50 dark:bg-pink-950/20 dark:text-pink-400" },
              { label: "CRM Leads Imported", value: importSummary.CrmLead || 0, icon: Table, color: "text-violet-600 bg-violet-50 dark:bg-violet-950/20 dark:text-violet-400" },
              { label: "Dynamic Custom Fields Registered", value: importSummary.CustomField || 0, icon: Sparkles, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400" }
            ].map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/40 flex items-center gap-4">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", card.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                      {card.value}
                    </span>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{card.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <CrmPanel>
            <CrmPanelHead
              title="Execution Summary Reports"
              subtitle="Relational model binding resolution statistics."
            />
            <CrmPanelBody className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800/60 bg-slate-50/30">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Ingestion Highlights</h4>
                  <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <li className="flex items-center justify-between">
                      <span>Total Teams Connected:</span>
                      <span className="text-slate-950 dark:text-white font-bold">{importSummary.CompanyTeam || 0}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>CRM Activity Log Entries Created:</span>
                      <span className="text-slate-950 dark:text-white font-bold">{importSummary.CrmActivity || 0}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Foreign Keys and Relational References Checked:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{mappingsResolved} matched</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800/60 bg-slate-50/30 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Target Data Inbound Dashboard</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      All leads, custom parameters, organization maps, and notes are immediately active inside the CRM pipelines and HRM dashboards.
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <CrmGhostButton onClick={handleReset} className="flex-1 justify-center">
                      Run Another Import
                    </CrmGhostButton>
                    <CrmPrimaryButton 
                      onClick={() => window.location.href = `/${workspaceId || "default"}/crm`}
                      className="flex-1 justify-center"
                    >
                      Inspect Imported Leads
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </CrmPrimaryButton>
                  </div>
                </div>
              </div>
            </CrmPanelBody>
          </CrmPanel>
        </div>
      )}
    </div>
  );
}
