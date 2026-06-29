"use client";

import { useState } from "react";
import { FileText, Plus, FileCode, CheckCircle, RefreshCw, Layers, Sparkles, Download, LayoutTemplate, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

type DocElement = {
  id: string;
  type: "heading" | "text" | "table";
  style?: string;
  content?: string;
  headers?: string[];
  rows?: string[][];
};

export function PdfEditorView() {
  const companyId = useHrCompanyId();
  const [activeTab, setActiveTab] = useState<"build" | "merge">("build");
  const [title, setTitle] = useState("Contract Agreement");
  const [elements, setElements] = useState<DocElement[]>([
    { id: "1", type: "heading", style: "h1", content: "STANDARD RETAINER AGREEMENT" },
    { id: "2", type: "text", content: "This contract is entered into on this date by and between RivexaFlow Enterprise and the respective Client." }
  ]);
  const [loading, setLoading] = useState(false);
  const [pdfLink, setPdfLink] = useState<string | null>(null);

  // Merge files state
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [mergedPdfLink, setMergedPdfLink] = useState<string | null>(null);

  const handleAddElement = (type: "heading" | "text" | "table") => {
    const id = String(Date.now());
    let newEl: DocElement;
    if (type === "heading") {
      newEl = { id, type, style: "h2", content: "New Subtitle Heading" };
    } else if (type === "text") {
      newEl = { id, type, content: "Enter your document body content details here..." };
    } else {
      newEl = { id, type, headers: ["Item Description", "Amount"], rows: [["Consulting Fee", "₹15,000"], ["Travel Expense", "₹2,500"]] };
    }
    setElements([...elements, newEl]);
  };

  const handleRemoveElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
  };

  const handleContentChange = (id: string, content: string) => {
    setElements(elements.map(el => el.id === id ? { ...el, content } : el));
  };

  const handleGeneratePdf = async () => {
    setLoading(true);
    setPdfLink(null);
    try {
      const res = await apiClient.post("/pdf-editor/create", {
        companyId,
        title,
        elements
      });
      if (res.data?.success) {
        // Build download link using host
        const dlLink = `${apiClient.defaults.baseURL}/pdf-editor/download/${res.data.data || "document.pdf"}`;
        // Wait, backend download endpoint is /api/pdf-editor/download/:fileName
        const finalLink = dlLink.replace("/api/api/", "/api/");
        setPdfLink(finalLink);
      }
    } catch (err) {
      alert("Failed to build PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleMergePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mergeFiles.length < 2) {
      alert("Please select at least 2 PDF files to merge.");
      return;
    }
    setLoading(true);
    setMergedPdfLink(null);
    try {
      const formData = new FormData();
      mergeFiles.forEach(file => {
        formData.append("files", file);
      });
      const res = await apiClient.post("/pdf-editor/merge", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data?.success) {
        const dlLink = `${apiClient.defaults.baseURL}/pdf-editor/download/${res.data.data}`;
        const finalLink = dlLink.replace("/api/api/", "/api/");
        setMergedPdfLink(finalLink);
      }
    } catch (err) {
      alert("Merging operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">PDF Document Editor</h1>
          <p className="mt-1 text-sm text-slate-500">Construct custom PDFs from JSON elements blocks, edit templates structure, and merge files.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setActiveTab("build")} className={`pb-3 text-sm font-semibold ${activeTab === "build" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Build PDF Document
        </button>
        <button onClick={() => setActiveTab("merge")} className={`pb-3 text-sm font-semibold ${activeTab === "merge" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-900"}`}>
          Merge PDFs
        </button>
      </div>

      {activeTab === "build" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builder Canvas */}
          <div className="lg:col-span-2 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-between items-center mb-4">
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="text-lg font-bold text-slate-950 dark:text-white border-b border-slate-200 pb-1 w-full mr-4 bg-transparent focus:outline-none focus:border-indigo-600" />
            </div>

            <div className="space-y-4 min-h-[300px]">
              {elements.map((el, idx) => (
                <div key={el.id} className="relative group border border-slate-100 hover:border-slate-200 p-4 rounded-lg bg-slate-50 dark:border-slate-850 dark:bg-slate-850/40">
                  <button onClick={() => handleRemoveElement(el.id)} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {el.type === "heading" && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-indigo-600 block uppercase">Heading Block ({el.style})</span>
                      <input type="text" value={el.content} onChange={e => handleContentChange(el.id, e.target.value)} className="w-full text-base font-bold bg-transparent border-b border-dashed border-slate-200 dark:border-slate-800" />
                    </div>
                  )}

                  {el.type === "text" && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-indigo-600 block uppercase">Paragraph Block</span>
                      <textarea rows={3} value={el.content} onChange={e => handleContentChange(el.id, e.target.value)} className="w-full text-sm bg-transparent border-b border-dashed border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300" />
                    </div>
                  )}

                  {el.type === "table" && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-indigo-600 block uppercase">Table Block</span>
                      <div className="text-xs font-mono text-slate-500">
                        Headers: {el.headers?.join(" | ")}
                        <br />
                        Rows: {el.rows?.length} items configured
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Builder Actions */}
            <div className="flex gap-2 border-t pt-4 mt-6">
              <button onClick={() => handleAddElement("heading")} className="rounded bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold dark:bg-slate-800 dark:text-white">
                + Add Heading
              </button>
              <button onClick={() => handleAddElement("text")} className="rounded bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold dark:bg-slate-800 dark:text-white">
                + Add Paragraph
              </button>
              <button onClick={() => handleAddElement("table")} className="rounded bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold dark:bg-slate-800 dark:text-white">
                + Add Table
              </button>
            </div>
          </div>

          {/* Builder Sidebar Download Panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Generate Document</h3>
            <button onClick={handleGeneratePdf} disabled={loading} className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              <FileCode className="h-4 w-4" /> {loading ? "Generating..." : "Compile PDF Document"}
            </button>

            {pdfLink && (
              <a href={pdfLink} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                <Download className="h-4 w-4" /> Download PDF File
              </a>
            )}
          </div>
        </div>
      ) : (
        // Merge PDFs panel
        <div className="max-w-md mx-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Merge PDF Documents</h3>
          <form onSubmit={handleMergePdfSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500">Select Files to Merge</label>
              <input required multiple type="file" accept="application/pdf" onChange={e => {
                if (e.target.files) setMergeFiles(Array.from(e.target.files));
              }} className="mt-2 w-full text-xs" />
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              {loading ? "Merging..." : "Compile & Merge PDFs"}
            </button>
          </form>

          {mergedPdfLink && (
            <a href={mergedPdfLink} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              <Download className="h-4 w-4" /> Download Merged PDF
            </a>
          )}
        </div>
      )}
    </div>
  );
}
