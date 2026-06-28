"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Bold, 
  Italic, 
  Palette, 
  ChevronLeft, 
  X, 
  FileSpreadsheet, 
  User, 
  Calendar, 
  ArrowLeft, 
  AlertCircle, 
  Check,
  FolderOpen,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";

// ==========================================
// Cell & Formula Parsing Engine
// ==========================================

export interface SheetCell {
  value: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  bg?: string;
}

const evaluateCell = (
  rawVal: string, 
  grid: SheetCell[][], 
  columns: string[], 
  visited: Set<string> = new Set()
): string => {
  if (!rawVal) return "";
  if (!rawVal.startsWith("=")) return rawVal;

  const expr = rawVal.substring(1).trim();

  // Helper to parse cell references like "A1" into indices
  const parseCellRef = (ref: string) => {
    const match = ref.match(/^([A-Z]+)([0-9]+)$/);
    if (!match) return null;
    const colStr = match[1];
    const rowStr = match[2];
    
    let colIdx = 0;
    for (let i = 0; i < colStr.length; i++) {
      colIdx = colIdx * 26 + (colStr.charCodeAt(i) - 64);
    }
    colIdx = colIdx - 1;

    const rowIdx = parseInt(rowStr, 10) - 1;
    return { colIdx, rowIdx };
  };

  const getCellValue = (ref: string): number => {
    const coords = parseCellRef(ref);
    if (!coords) return 0;
    const { colIdx, rowIdx } = coords;
    if (rowIdx < 0 || rowIdx >= grid.length || colIdx < 0 || colIdx >= columns.length) {
      return 0;
    }
    
    const cellKey = `${colIdx},${rowIdx}`;
    if (visited.has(cellKey)) return 0; // Circular Reference Guard

    const nextVisited = new Set(visited);
    nextVisited.add(cellKey);

    const cellObj = grid[rowIdx][colIdx];
    const cellRaw = typeof cellObj === 'string' ? cellObj : (cellObj?.value || "");
    const evaled = evaluateCell(cellRaw, grid, columns, nextVisited);
    const num = parseFloat(evaled);
    return isNaN(num) ? 0 : num;
  };

  const getCellValuesRange = (rangeStr: string): number[] => {
    const parts = rangeStr.split(":");
    if (parts.length !== 2) return [];
    const start = parseCellRef(parts[0].trim());
    const end = parseCellRef(parts[1].trim());
    if (!start || !end) return [];

    const minRow = Math.min(start.rowIdx, end.rowIdx);
    const maxRow = Math.max(start.rowIdx, end.rowIdx);
    const minCol = Math.min(start.colIdx, end.colIdx);
    const maxCol = Math.max(start.colIdx, end.colIdx);

    const values: number[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (r >= 0 && r < grid.length && c >= 0 && c < columns.length) {
          const cellKey = `${c},${r}`;
          if (!visited.has(cellKey)) {
            const nextVisited = new Set(visited);
            nextVisited.add(cellKey);
            const cellObj = grid[r][c];
            const cellRaw = typeof cellObj === 'string' ? cellObj : (cellObj?.value || "");
            const evaled = evaluateCell(cellRaw, grid, columns, nextVisited);
            const num = parseFloat(evaled);
            values.push(isNaN(num) ? 0 : num);
          } else {
            values.push(0);
          }
        }
      }
    }
    return values;
  };

  // Evaluate aggregations: SUM, AVERAGE, COUNT, MIN, MAX
  const funcMatch = expr.match(/^(SUM|AVERAGE|COUNT|MIN|MAX)\(([^)]+)\)$/i);
  if (funcMatch) {
    const funcName = funcMatch[1].toUpperCase();
    const funcArgs = funcMatch[2];

    let numbers: number[] = [];
    if (funcArgs.includes(":")) {
      numbers = getCellValuesRange(funcArgs);
    } else {
      const argsList = funcArgs.split(",");
      for (const arg of argsList) {
        const trimmed = arg.trim();
        if (trimmed.match(/^[A-Z]+[0-9]+$/i)) {
          numbers.push(getCellValue(trimmed));
        } else {
          const num = parseFloat(trimmed);
          if (!isNaN(num)) numbers.push(num);
        }
      }
    }

    if (funcName === "SUM") {
      return numbers.reduce((acc, curr) => acc + curr, 0).toString();
    }
    if (funcName === "AVERAGE") {
      return numbers.length === 0 ? "0" : (numbers.reduce((acc, curr) => acc + curr, 0) / numbers.length).toString();
    }
    if (funcName === "COUNT") {
      return numbers.length.toString();
    }
    if (funcName === "MIN") {
      return numbers.length === 0 ? "0" : Math.min(...numbers).toString();
    }
    if (funcName === "MAX") {
      return numbers.length === 0 ? "0" : Math.max(...numbers).toString();
    }
  }

  // Handle algebraic formulas like =A1+B2*5
  let resolvedExpr = expr;
  const cellRefRegex = /[A-Z]+[0-9]+/g;
  let match;
  let limit = 0;
  while ((match = cellRefRegex.exec(expr)) !== null && limit < 100) {
    limit++;
    const ref = match[0];
    const val = getCellValue(ref);
    resolvedExpr = resolvedExpr.replace(new RegExp(`\\b${ref}\\b`, 'g'), val.toString());
  }

  if (/^[0-9+\-*/().\s]+$/.test(resolvedExpr)) {
    try {
      const result = Function("return " + resolvedExpr)();
      return typeof result === "number" && !isNaN(result) ? result.toString() : "#ERROR!";
    } catch {
      return "#ERROR!";
    }
  }

  return "#VALUE!";
};

interface ExcelFunc {
  name: string;
  description: string;
  example: string;
}

const ALL_EXCEL_FUNCTIONS: ExcelFunc[] = [
  { name: "SUM", description: "Adds all the numbers in a range of cells.", example: "=SUM(A1:B3)" },
  { name: "AVERAGE", description: "Returns the average (arithmetic mean) of the arguments.", example: "=AVERAGE(A1:B3)" },
  { name: "COUNT", description: "Counts the number of cells in a range that contain numbers.", example: "=COUNT(A1:B3)" },
  { name: "COUNTA", description: "Counts the number of cells in a range that are not empty.", example: "=COUNTA(A1:B3)" },
  { name: "MIN", description: "Returns the smallest number in a set of values.", example: "=MIN(A1:B3)" },
  { name: "MAX", description: "Returns the largest number in a set of values.", example: "=MAX(A1:B3)" },
  { name: "PRODUCT", description: "Multiplies all the numbers given as arguments.", example: "=PRODUCT(A1:A5)" },
  { name: "ROUND", description: "Rounds a number to a specified number of digits.", example: "=ROUND(A1, 2)" },
  { name: "SQRT", description: "Returns a positive square root.", example: "=SQRT(A1)" },
  { name: "ABS", description: "Returns the absolute value of a number.", example: "=ABS(A1)" },
  { name: "POWER", description: "Returns the result of a number raised to a power.", example: "=POWER(A1, 2)" },
  { name: "MOD", description: "Returns the remainder from division.", example: "=MOD(A1, B1)" },
  { name: "CEILING", description: "Rounds a number up, to the nearest integer or multiple of significance.", example: "=CEILING(A1, 1)" },
  { name: "FLOOR", description: "Rounds a number down, toward zero.", example: "=FLOOR(A1, 1)" },
  { name: "SUMIF", description: "Adds the cells specified by a given criteria.", example: "=SUMIF(A1:A10, \">5\")" },
  { name: "IF", description: "Specifies a logical test to perform.", example: "=IF(A1>10, \"Yes\", \"No\")" },
  { name: "AND", description: "Returns TRUE if all of its arguments are TRUE.", example: "=AND(A1>0, B1<10)" },
  { name: "OR", description: "Returns TRUE if any argument is TRUE.", example: "=OR(A1>0, B1>0)" },
  { name: "NOT", description: "Reverses the value of its argument.", example: "=NOT(A1>10)" },
  { name: "CONCAT", description: "Combines the text from multiple ranges and/or strings.", example: "=CONCAT(A1, B1)" },
  { name: "LEN", description: "Returns the number of characters in a text string.", example: "=LEN(A1)" },
  { name: "UPPER", description: "Converts text to uppercase.", example: "=UPPER(A1)" },
  { name: "LOWER", description: "Converts text to lowercase.", example: "=LOWER(A1)" },
  { name: "TRIM", description: "Removes spaces from text.", example: "=TRIM(A1)" },
  { name: "LEFT", description: "Returns the leftmost characters from a text value.", example: "=LEFT(A1, 3)" },
  { name: "RIGHT", description: "Returns the rightmost characters from a text value.", example: "=RIGHT(A1, 3)" },
  { name: "MID", description: "Returns a specific number of characters from a text string starting at the position you specify.", example: "=MID(A1, 2, 3)" },
  { name: "VLOOKUP", description: "Looks for a value in the leftmost column of a table.", example: "=VLOOKUP(A1, B1:D10, 2, FALSE)" },
  { name: "HLOOKUP", description: "Looks for a value in the top row of a table.", example: "=HLOOKUP(A1, B1:D10, 2, FALSE)" },
  { name: "TODAY", description: "Returns the serial number of today's date.", example: "=TODAY()" },
  { name: "NOW", description: "Returns the serial number of the current date and time.", example: "=NOW()" },
  { name: "YEAR", description: "Converts a serial number to a year.", example: "=YEAR(A1)" },
  { name: "MONTH", description: "Converts a serial number to a month.", example: "=MONTH(A1)" },
  { name: "DAY", description: "Converts a serial number to a day of the month.", example: "=DAY(A1)" }
];

const getFormulaQuery = (text: string): string | null => {
  if (!text || !text.startsWith("=")) return null;
  const match = text.match(/([A-Z]+)$/i);
  return match ? match[1].toUpperCase() : null;
};

// ==========================================
// React UI Component
// ==========================================

interface SheetInfo {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  size: number;
  url: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

const defaultCols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
const defaultRows = Array(40).fill(null).map(() => Array(20).fill({ value: "" }));

export function CrmSheetsView() {
  const user = authStore((s) => s.user);
  const brandName = workspaceStore((s) => s.brandName);
  const workspaceName = workspaceStore((s) => s.workspaceName);
  const companyName = (brandName || workspaceName || "Company").trim().split(/\s+/)[0];
  
  // Dashboard state
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Editor state
  const [activeSheet, setActiveSheet] = useState<SheetInfo | null>(null);
  const [gridData, setGridData] = useState<SheetCell[][]>([]);
  const [gridColumns, setGridColumns] = useState<string[]>([]);
  const [editorLoading, setEditorLoading] = useState(false);
  
  // Custom sizing states
  const [colWidths, setColWidths] = useState<Record<number, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
  const [savingStatus, setSavingStatus] = useState<"saved" | "saving" | "unsaved" | "error" | null>(null);
  
  const isLoadedRef = useRef(false);

  // Active cell state
  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ r: number; c: number } | null>(null);
  const [editInput, setEditInput] = useState("");
  const [showFormulaHelp, setShowFormulaHelp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Style panel state
  const [textColorPicker, setTextColorPicker] = useState(false);
  const [bgColorPicker, setBgColorPicker] = useState(false);

  const editInputRef = useRef<HTMLInputElement>(null);

  // Autocomplete states
  const [suggestIndex, setSuggestIndex] = useState(0);
  const [activeInputRect, setActiveInputRect] = useState<DOMRect | null>(null);

  const selectSuggestion = (func: ExcelFunc) => {
    const text = editInput;
    const match = text.match(/([A-Z]+)$/i);
    if (match) {
      const idx = match.index!;
      const newVal = text.substring(0, idx) + func.name + "(";
      setEditInput(newVal);
      if (activeCell) {
        updateCellValue(activeCell.r, activeCell.c, newVal);
      }
    }
    setSuggestIndex(0);
  };

  useEffect(() => {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === "INPUT" || activeEl.getAttribute("type") === "text")) {
      const rect = activeEl.getBoundingClientRect();
      setActiveInputRect(rect);
    } else {
      setActiveInputRect(null);
    }
  }, [editInput, editingCell, activeCell]);

  const suggestQuery = getFormulaQuery(editInput);
  const suggestions = useMemo(() => {
    return suggestQuery ? ALL_EXCEL_FUNCTIONS.filter(f => f.name.startsWith(suggestQuery)) : [];
  }, [suggestQuery]);

  // Resizing Handlers
  const handleColResizeMouseDown = (e: React.MouseEvent, colIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = colWidths[colIdx] || 112; // default 112px

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(60, startWidth + deltaX); // min width 60px
      setColWidths(prev => ({ ...prev, [colIdx]: newWidth }));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleRowResizeMouseDown = (e: React.MouseEvent, rowIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startHeight = rowHeights[rowIdx] || 28; // default 28px

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(20, startHeight + deltaY); // min height 20px
      setRowHeights(prev => ({ ...prev, [rowIdx]: newHeight }));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!activeSheet || !isLoadedRef.current) return;

    setSavingStatus("unsaved");

    const delayDebounce = setTimeout(async () => {
      try {
        setSavingStatus("saving");
        await apiClient.put(`/integrations/rivexaflow-sheet/${activeSheet.id}`, {
          columns: gridColumns,
          rows: gridData,
          colWidths,
          rowHeights
        });
        setSavingStatus("saved");
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSavingStatus("error");
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(delayDebounce);
  }, [gridData, gridColumns, colWidths, rowHeights, activeSheet]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("rvx-sheets-cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSheets(parsed);
            setLoading(false);
          }
        }
      } catch {
        // Cache read fallback
      }
    }
    fetchSheets();
  }, []);

  const [showJoinCompanyModal, setShowJoinCompanyModal] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
  };

  const fetchSheets = async () => {
    try {
      const { data } = await apiClient.get("/integrations/rivexaflow-sheet/list");
      if (data?.success) {
        const listData = data.data || [];
        setSheets(listData);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("rvx-sheets-cache", JSON.stringify(listData));
          } catch {
            // Cache write fallback
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "";
      if (errorMsg.includes("Not a member of this company") || err.response?.status === 403) {
        setShowJoinCompanyModal(true);
      } else {
        showToast(errorMsg || "Failed to load sheets.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelfJoin = async () => {
    setJoining(true);
    try {
      const companyId = user?.workspaceId || "company_1";
      const { data } = await apiClient.post(`/company/${companyId}/self-join`);
      if (data?.success) {
        showToast("Successfully joined the company!");
        setShowJoinCompanyModal(false);
        fetchSheets();
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to join company.", "error");
    } finally {
      setJoining(false);
    }
  };

  const handleCreateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetName.trim()) return;

    try {
      const companyId = user?.workspaceId || "company_1";
      const { data } = await apiClient.post("/integrations/rivexaflow-sheet/create", {
        companyId,
        name: newSheetName.trim(),
        columns: defaultCols,
        rows: defaultRows
      });

      if (data?.success) {
        showToast("Spreadsheet created successfully!");
        setIsCreateModalOpen(false);
        setNewSheetName("");
        fetchSheets();
        
        // Open the newly created sheet immediately
        if (data.data?.documentId) {
          openSpreadsheet({
            id: data.data.documentId,
            name: data.data.displayName || newSheetName,
            fileName: `${data.data.sheetId}.json`,
            fileType: "spreadsheet",
            size: 0,
            url: data.data.url,
            ownerId: user?.id || "",
            ownerName: user?.fullName || user?.name || "Me",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to create spreadsheet.", "error");
    }
  };

  const handleDeleteSheet = async (sheetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this spreadsheet? This action is permanent.")) return;

    try {
      const { data } = await apiClient.delete(`/integrations/rivexaflow-sheet/${sheetId}`);
      if (data?.success) {
        showToast("Spreadsheet deleted successfully.");
        fetchSheets();
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to delete spreadsheet.", "error");
    }
  };
  const openSpreadsheet = async (sheet: SheetInfo) => {
    try {
      setEditorLoading(true);
      setActiveSheet(sheet);
      setActiveCell(null);
      setEditingCell(null);
      setEditInput("");
      isLoadedRef.current = false;
      setSavingStatus(null);

      const { data } = await apiClient.get(`/integrations/rivexaflow-sheet/${sheet.id}`);
      if (data?.success) {
        const columns = data.data.columns || defaultCols;
        const rawRows = data.data.rows || [];
        
        // Normalize rows to SheetCell structure
        const parsedRows = rawRows.map((row: any[]) => 
          row.map((cell: any) => {
            if (typeof cell === 'string') {
              return { value: cell };
            }
            return {
              value: cell?.value || "",
              bold: !!cell?.bold,
              italic: !!cell?.italic,
              color: cell?.color || "",
              bg: cell?.bg || ""
            };
          })
        );

        setGridColumns(columns);
        setGridData(parsedRows);
        setColWidths(data.data.colWidths || {});
        setRowHeights(data.data.rowHeights || {});

        setTimeout(() => {
          isLoadedRef.current = true;
          setSavingStatus("saved");
        }, 300);
      }
    } catch (err: any) {
      console.error(err);
      showToast("Failed to load spreadsheet contents.", "error");
      setActiveSheet(null);
    } finally {
      setEditorLoading(false);
    }
  };

  const handleSaveSheet = async () => {
    if (!activeSheet) return;
    try {
      setSaving(true);
      setSavingStatus("saving");
      const { data } = await apiClient.put(`/integrations/rivexaflow-sheet/${activeSheet.id}`, {
        columns: gridColumns,
        rows: gridData,
        colWidths,
        rowHeights
      });
      if (data?.success) {
        showToast("Spreadsheet saved successfully!");
        setSavingStatus("saved");
        fetchSheets();
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.error || "Failed to save spreadsheet.", "error");
      setSavingStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleExitEditor = async (saveOption: "save" | "discard" | "cancel") => {
    if (saveOption === "cancel") {
      setShowExitModal(false);
      return;
    }
    if (saveOption === "discard") {
      setShowExitModal(false);
      setActiveSheet(null);
      return;
    }
    if (saveOption === "save") {
      if (!activeSheet) return;
      try {
        setSaving(true);
        setSavingStatus("saving");
        const { data } = await apiClient.put(`/integrations/rivexaflow-sheet/${activeSheet.id}`, {
          columns: gridColumns,
          rows: gridData,
          colWidths,
          rowHeights
        });
        if (data?.success) {
          showToast("Spreadsheet saved successfully!");
          setSavingStatus("saved");
          fetchSheets();
          setShowExitModal(false);
          setActiveSheet(null);
        }
      } catch (err: any) {
        console.error(err);
        showToast(err.response?.data?.error || "Failed to save spreadsheet.", "error");
        setSavingStatus("error");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleFormulaInputKeyDown = (e: React.KeyboardEvent, onConfirmDefault?: () => void) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectSuggestion(suggestions[suggestIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSuggestIndex(0);
      }
    } else {
      if (e.key === "Enter" && onConfirmDefault) {
        onConfirmDefault();
      }
    }
  };

  const handleCellSelect = (r: number, c: number) => {
    if (editingCell && (editingCell.r !== r || editingCell.c !== c)) {
      saveCellEdit();
    }
    setActiveCell({ r, c });
    const cell = gridData[r][c];
    setEditInput(cell?.value || "");
  };

  const handleCellDoubleClick = (r: number, c: number) => {
    setActiveCell({ r, c });
    setEditingCell({ r, c });
    const cell = gridData[r][c];
    setEditInput(cell?.value || "");
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 50);
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editingCell) {
        saveCellEdit();
      } else {
        setEditingCell({ r, c });
        setTimeout(() => {
          editInputRef.current?.focus();
          editInputRef.current?.select();
        }, 50);
      }
    } else if (e.key === "Escape") {
      setEditingCell(null);
      const cell = gridData[r][c];
      setEditInput(cell?.value || "");
    } else if (!editingCell) {
      // Navigation keys
      if (e.key === "ArrowUp" && r > 0) {
        e.preventDefault();
        handleCellSelect(r - 1, c);
      } else if (e.key === "ArrowDown" && r < gridData.length - 1) {
        e.preventDefault();
        handleCellSelect(r + 1, c);
      } else if (e.key === "ArrowLeft" && c > 0) {
        e.preventDefault();
        handleCellSelect(r, c - 1);
      } else if (e.key === "ArrowRight" && c < gridColumns.length - 1) {
        e.preventDefault();
        handleCellSelect(r, c + 1);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        updateCellValue(r, c, "");
        setEditInput("");
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Typing directly starts editing
        setEditingCell({ r, c });
        setEditInput(e.key);
        setTimeout(() => {
          editInputRef.current?.focus();
        }, 50);
      }
    }
  };

  const saveCellEdit = () => {
    if (!editingCell) return;
    updateCellValue(editingCell.r, editingCell.c, editInput);
    setEditingCell(null);
  };

  const updateCellValue = (r: number, c: number, val: string) => {
    const updated = [...gridData];
    updated[r] = [...updated[r]];
    updated[r][c] = {
      ...updated[r][c],
      value: val
    };
    setGridData(updated);
  };

  const toggleStyle = (style: "bold" | "italic") => {
    if (!activeCell) return;
    const { r, c } = activeCell;
    const updated = [...gridData];
    updated[r] = [...updated[r]];
    
    updated[r][c] = {
      ...updated[r][c],
      [style]: !updated[r][c]?.[style]
    };
    setGridData(updated);
  };

  const applyColor = (color: string, type: "color" | "bg") => {
    if (!activeCell) return;
    const { r, c } = activeCell;
    const updated = [...gridData];
    updated[r] = [...updated[r]];

    updated[r][c] = {
      ...updated[r][c],
      [type]: color
    };
    setGridData(updated);
    setTextColorPicker(false);
    setBgColorPicker(false);
  };

  // Grid editing functions
  const handleAddRow = () => {
    const newRow = Array(gridColumns.length).fill(null).map(() => ({ value: "" }));
    setGridData([...gridData, newRow]);
    showToast("Added new row at bottom");
  };

  const handleAddColumn = () => {
    // Generate next column code (A, B... Z, AA, AB...)
    const getNextColName = (index: number) => {
      let colName = "";
      let temp = index;
      while (temp >= 0) {
        colName = String.fromCharCode((temp % 26) + 65) + colName;
        temp = Math.floor(temp / 26) - 1;
      }
      return colName;
    };
    const nextCol = getNextColName(gridColumns.length);
    setGridColumns([...gridColumns, nextCol]);

    const updated = gridData.map(row => [...row, { value: "" }]);
    setGridData(updated);
    showToast(`Added new column ${nextCol}`);
  };

  const handleDeleteRow = () => {
    if (!activeCell) return;
    const { r } = activeCell;
    if (gridData.length <= 1) return;
    
    const updated = gridData.filter((_, idx) => idx !== r);
    setGridData(updated);
    setActiveCell(null);
    showToast(`Deleted row ${r + 1}`);
  };

  const handleDeleteColumn = () => {
    if (!activeCell) return;
    const { c } = activeCell;
    if (gridColumns.length <= 1) return;

    const colName = gridColumns[c];
    const newCols = gridColumns.filter((_, idx) => idx !== c);
    // Regenerate header names to preserve alphabetical progression
    const regeneratedCols = newCols.map((_, idx) => {
      let colName = "";
      let temp = idx;
      while (temp >= 0) {
        colName = String.fromCharCode((temp % 26) + 65) + colName;
        temp = Math.floor(temp / 26) - 1;
      }
      return colName;
    });

    const updated = gridData.map(row => row.filter((_, idx) => idx !== c));
    setGridColumns(regeneratedCols);
    setGridData(updated);
    setActiveCell(null);
    showToast(`Deleted column ${colName}`);
  };

  const handleExportCSV = () => {
    if (!activeSheet) return;
    
    // Evaluate grid
    const csvRows = gridData.map(row => 
      row.map(cell => {
        const val = typeof cell === 'string' ? cell : (cell?.value || "");
        const evaled = evaluateCell(val, gridData, gridColumns);
        // Escape commas for csv format
        const escaped = String(evaled).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeSheet.name.replace(/\s+/g, "_")}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded CSV successfully.");
  };

  const getCellLabel = (r: number, c: number) => {
    if (c >= gridColumns.length) return "";
    return `${gridColumns[c]}${r + 1}`;
  };

  const filteredSheets = useMemo(() => {
    return sheets.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sheets, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Dynamic Toast Notifications */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-4 shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90 animate-in slide-in-from-top-4 duration-300">
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${notification.type === "success" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"}`}>
            {notification.type === "success" ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{notification.message}</span>
        </div>
      )}

      {activeSheet ? (
        // ==========================================
        // Excel Editor Overlay Layout
        // ==========================================
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950">
          {/* Main Top Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (savingStatus === "saved" || !savingStatus) {
                    setActiveSheet(null);
                  } else {
                    setShowExitModal(true);
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                  {activeSheet.name}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Owned by {activeSheet.ownerName}
                  </p>
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  
                  {savingStatus === "saving" && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-605 dark:text-amber-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Saving changes...
                    </span>
                  )}
                  {savingStatus === "saved" && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-500 font-semibold animate-in fade-in duration-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      All changes saved
                    </span>
                  )}
                  {savingStatus === "unsaved" && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Unsaved changes
                    </span>
                  )}
                  {savingStatus === "error" && (
                    <span className="flex items-center gap-1 text-[11px] text-red-500 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-bounce" />
                      Auto-save failed
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700 transition"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>

              <button
                onClick={handleSaveSheet}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 transition"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Sheet"}
              </button>
            </div>
          </div>

          {/* Quick Toolbar (Formatting, Math helper, Grid manipulation) */}
          <div className="flex min-h-12 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950 flex-wrap gap-2 py-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Bold / Italic */}
              <button
                onClick={() => toggleStyle("bold")}
                disabled={!activeCell}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                  activeCell && gridData[activeCell.r]?.[activeCell.c]?.bold
                    ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
                } disabled:opacity-30`}
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </button>

              <button
                onClick={() => toggleStyle("italic")}
                disabled={!activeCell}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                  activeCell && gridData[activeCell.r]?.[activeCell.c]?.italic
                    ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
                } disabled:opacity-30`}
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

              {/* Text Color Picker */}
              <div className="relative">
                <button
                  onClick={() => { setTextColorPicker(!textColorPicker); setBgColorPicker(false); }}
                  disabled={!activeCell}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition disabled:opacity-30"
                  title="Text Color"
                >
                  <Palette className="h-4 w-4 text-red-500" />
                </button>
                {textColorPicker && (
                  <div className="absolute top-10 left-0 z-50 grid grid-cols-5 gap-1 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 w-44">
                    {["#000000", "#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#6B7280", "#1E3A8A", "#064E3B"].map(color => (
                      <button
                        key={color}
                        onClick={() => applyColor(color, "color")}
                        className="h-6 w-6 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <button
                      onClick={() => applyColor("", "color")}
                      className="col-span-5 text-center text-xs py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-500 dark:text-slate-400"
                    >
                      Clear Color
                    </button>
                  </div>
                )}
              </div>

              {/* Background Color Picker */}
              <div className="relative">
                <button
                  onClick={() => { setBgColorPicker(!bgColorPicker); setTextColorPicker(false); }}
                  disabled={!activeCell}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition disabled:opacity-30"
                  title="Cell Background Color"
                >
                  <Palette className="h-4 w-4 text-slate-800 dark:text-slate-200 fill-slate-200" />
                </button>
                {bgColorPicker && (
                  <div className="absolute top-10 left-0 z-50 grid grid-cols-5 gap-1 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 w-44">
                    {["#FFFFFF", "#FEE2E2", "#DBEAFE", "#D1FAE5", "#FEF3C7", "#EDE9FE", "#FCE7F3", "#F3F4F6", "#BFDBFE", "#A7F3D0"].map(color => (
                      <button
                        key={color}
                        onClick={() => applyColor(color, "bg")}
                        className="h-6 w-6 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <button
                      onClick={() => applyColor("", "bg")}
                      className="col-span-5 text-center text-xs py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-500 dark:text-slate-400"
                    >
                      Clear Background
                    </button>
                  </div>
                )}
              </div>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

              {/* Grid Insert Operations */}
              <button
                onClick={handleAddRow}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 transition"
              >
                + Row
              </button>
              <button
                onClick={handleAddColumn}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 transition"
              >
                + Column
              </button>

              <button
                onClick={handleDeleteRow}
                disabled={!activeCell}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition disabled:opacity-30"
              >
                - Row
              </button>
              <button
                onClick={handleDeleteColumn}
                disabled={!activeCell}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition disabled:opacity-30"
              >
                - Column
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <button
                onClick={() => setShowFormulaHelp(!showFormulaHelp)}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <HelpCircle className="h-4 w-4" />
                Formulas Guide
              </button>
            </div>
          </div>

          {/* Formula Help Overlay Panel */}
          {showFormulaHelp && (
            <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-3.5 dark:bg-indigo-950/20 dark:border-indigo-950/50 flex items-start justify-between gap-4 animate-in fade-in duration-300">
              <div className="text-xs text-indigo-900 dark:text-indigo-200">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Excel-Like Formula Instructions:
                </p>
                <p className="mb-1">
                  Prefix formulas with <code className="bg-white/80 dark:bg-slate-900 px-1 py-0.5 rounded font-mono font-bold text-red-600 dark:text-red-400">=</code>. Supported aggregations include:
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono mt-1 text-slate-800 dark:text-indigo-300">
                  <span><strong>SUM:</strong> =SUM(A1:A5) or =SUM(A1, B3, C2)</span>
                  <span><strong>AVERAGE:</strong> =AVERAGE(A1:B3)</span>
                  <span><strong>COUNT:</strong> =COUNT(A1:C1)</span>
                  <span><strong>MIN / MAX:</strong> =MIN(A1:B2)</span>
                  <span><strong>Algebra:</strong> =A1+B1*1.08 or =(A1-B1)/2</span>
                </div>
              </div>
              <button 
                onClick={() => setShowFormulaHelp(false)}
                className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Formula Bar Section */}
          <div className="flex h-11 items-center border-b border-slate-200 bg-slate-50/50 px-4 dark:border-slate-800 dark:bg-slate-900/50">
            {/* Cell Coordinate display */}
            <div className="flex h-7 min-w-16 items-center justify-center rounded bg-white text-xs font-bold text-slate-700 shadow-sm border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              {activeCell ? getCellLabel(activeCell.r, activeCell.c) : ""}
            </div>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-3" />
            
            {/* fx symbol label */}
            <span className="font-serif italic text-sm font-black text-slate-400 mr-3">fx</span>

            {/* Formula Input */}
            <input
              type="text"
              value={editInput}
              disabled={!activeCell}
              onChange={(e) => {
                setEditInput(e.target.value);
                if (activeCell) {
                  updateCellValue(activeCell.r, activeCell.c, e.target.value);
                }
              }}
              onKeyDown={(e) => handleFormulaInputKeyDown(e, () => {
                if (activeCell) saveCellEdit();
              })}
              placeholder={activeCell ? "Enter value or formula starting with =" : "Select a cell to enter data"}
              className="flex-1 h-7 bg-white border border-slate-200/80 rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          {/* Spreadsheet Data Grid */}
          <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900">
            {editorLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-600 dark:border-slate-700" />
              </div>
            ) : (
              <table className="border-collapse table-fixed w-max bg-white dark:bg-slate-950 text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-500 select-none">
                    {/* Top-Left Empty Anchor */}
                    <th className="sticky top-0 left-0 z-30 h-7 w-12 border-r border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
                    
                    {/* Grid Column Headers */}
                    {gridColumns.map((col, cIdx) => (
                      <th
                        key={col}
                        style={{ 
                          width: colWidths[cIdx] || 112,
                          minWidth: colWidths[cIdx] || 112,
                          maxWidth: colWidths[cIdx] || 112
                        }}
                        className="sticky top-0 z-20 h-7 border-r border-b border-slate-200 bg-slate-50 text-center dark:border-slate-800 dark:bg-slate-900 relative group"
                      >
                        {col}
                        {/* Drag Handle Column Resize */}
                        <div
                          onMouseDown={(e) => handleColResizeMouseDown(e, cIdx)}
                          className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-500/60 active:bg-emerald-600 transition z-30 opacity-0 group-hover:opacity-100 active:opacity-100"
                          title="Drag to resize column"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gridData.map((row, rIdx) => (
                    <tr 
                      key={rIdx} 
                      style={{ height: rowHeights[rIdx] || 28 }}
                      className="text-xs text-slate-800 dark:text-slate-200"
                    >
                      {/* Leftmost Row Number Header */}
                      <td 
                        style={{ height: rowHeights[rIdx] || 28 }}
                        className="sticky left-0 z-20 border-r border-b border-slate-200 bg-slate-50 text-center font-bold text-slate-500 select-none dark:border-slate-800 dark:bg-slate-900 relative group"
                      >
                        {rIdx + 1}
                        {/* Drag Handle Row Resize */}
                        <div
                          onMouseDown={(e) => handleRowResizeMouseDown(e, rIdx)}
                          className="absolute bottom-0 left-0 right-0 h-1.5 cursor-row-resize hover:bg-emerald-500/60 active:bg-emerald-600 transition z-30 opacity-0 group-hover:opacity-100 active:opacity-100"
                          title="Drag to resize row"
                        />
                      </td>

                      {/* Cells */}
                      {row.map((cell, cIdx) => {
                        const cellVal = cell?.value || "";
                        const displayVal = evaluateCell(cellVal, gridData, gridColumns);
                        const isSelected = activeCell?.r === rIdx && activeCell?.c === cIdx;
                        const isEditing = editingCell?.r === rIdx && editingCell?.c === cIdx;

                        return (
                          <td
                            key={cIdx}
                            onClick={() => handleCellSelect(rIdx, cIdx)}
                            onDoubleClick={() => handleCellDoubleClick(rIdx, cIdx)}
                            onKeyDown={(e) => handleCellKeyDown(e, rIdx, cIdx)}
                            tabIndex={0}
                            style={{
                              color: cell?.color || undefined,
                              backgroundColor: cell?.bg || undefined,
                              fontWeight: cell?.bold ? "bold" : "normal",
                              fontStyle: cell?.italic ? "italic" : "normal",
                            }}
                            className={`border-r border-b border-slate-200 px-2 py-0.5 outline-none relative truncate dark:border-slate-800/80 cursor-cell select-none ${
                              isSelected 
                                ? "ring-2 ring-emerald-500/80 bg-emerald-50/20 z-10" 
                                : "hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                            }`}
                          >
                            {isEditing ? (
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editInput}
                                onChange={(e) => setEditInput(e.target.value)}
                                onBlur={saveCellEdit}
                                onKeyDown={(e) => handleFormulaInputKeyDown(e, () => {
                                  saveCellEdit();
                                })}
                                className="absolute inset-0 w-full h-full px-2 py-0 bg-white text-slate-900 focus:outline-none dark:bg-slate-800 dark:text-white border-none text-xs font-normal"
                              />
                            ) : (
                              displayVal
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {suggestions.length > 0 && activeInputRect && (
            <div
              style={{
                position: "fixed",
                left: activeInputRect.left,
                top: activeInputRect.bottom + 4,
                zIndex: 9999
              }}
              className="w-72 max-h-56 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl dark:border-slate-800 dark:bg-slate-950/95 backdrop-blur-xl p-1.5 scrollbar-none flex flex-col gap-0.5 animate-in fade-in duration-100"
            >
              {suggestions.map((func, idx) => {
                const isSelected = idx === suggestIndex;
                return (
                  <div
                    key={func.name}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Keep input focused
                      selectSuggestion(func);
                    }}
                    className={`flex flex-col text-left px-3 py-2 rounded-xl cursor-pointer transition select-none ${
                      isSelected
                        ? "bg-gradient-to-br from-[#191970] to-[#2277ff] text-white shadow-md shadow-[#191970]/10"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[13px] tracking-tight">{func.name}</span>
                      <span className={`text-[10px] font-mono font-medium ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                        {func.example}
                      </span>
                    </div>
                    <span className={`text-[11px] mt-1 leading-normal ${isSelected ? "text-white/90" : "text-slate-500 dark:text-slate-400"}`}>
                      {func.description}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // ==========================================
        // Spreadsheets Dashboard Layout
        // ==========================================
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-bold mb-1">
                <FileSpreadsheet className="h-5 w-5" />
                <span>{companyName} Modules</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {companyName} Sheets
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Create, share, and manage Excel-compatible spreadsheet dashboards.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-br from-[#191970] to-[#2277ff] text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-[#191970]/15 hover:shadow-xl hover:shadow-[#191970]/25 hover:translate-y-[-1px] transition duration-200"
            >
              <Plus className="h-5 w-5" />
              Create Spreadsheet
            </button>
          </div>

          {/* Search, Stats, & Actions Bar */}
          <div className="bg-white/80 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search sheets by name or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3 py-1.5 rounded-xl">
                <Clock className="h-4 w-4 text-indigo-500" />
                Total Sheets: {sheets.length}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3 py-1.5 rounded-xl">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                Role scope: {user?.role || "MEMBER"}
              </span>
            </div>
          </div>

          {/* Sheets Lists Grid */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#191970]" />
            </div>
          ) : filteredSheets.length === 0 ? (
            <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/85 rounded-3xl p-12 text-center shadow-sm">
              <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/80 dark:border-slate-800 text-slate-400">
                <FileSpreadsheet className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No spreadsheets found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto text-sm">
                {searchQuery ? "No spreadsheets matched your search criteria." : "Create your first collaborative sheet to get started with analysis."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 bg-[#191970] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-900 transition"
                >
                  <Plus className="h-4 w-4" />
                  Create Spreadsheet
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSheets.map((sheet) => (
                <div
                  key={sheet.id}
                  onClick={() => openSpreadsheet(sheet)}
                  className="group bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-805/85 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Icon & Meta actions */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 group-hover:scale-105 transition-transform">
                        <FileSpreadsheet className="h-6 w-6" />
                      </div>
                      
                      <button
                        onClick={(e) => handleDeleteSheet(sheet.id, e)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition"
                        title="Delete spreadsheet"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      {sheet.name}
                    </h3>
                    
                    {/* Owner */}
                    <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <User className="h-3.5 w-3.5 text-[#191970] dark:text-[#2277ff]" />
                      <span>By {sheet.ownerName}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{new Date(sheet.createdAt).toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Size: {Math.round(sheet.size / 102) / 10} KB</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                      Open Sheet
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Creation Modal */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in scale-in duration-200">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                    New Spreadsheet
                  </h3>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-500 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateSheet} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Spreadsheet Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sales Pipeline Audit Q2"
                      value={newSheetName}
                      onChange={(e) => setNewSheetName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl hover:bg-slate-200 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-br from-[#191970] to-[#2277ff] text-white font-bold py-3 rounded-2xl hover:brightness-110 shadow-lg shadow-indigo-600/10 transition"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Join Company Modal */}
          {showJoinCompanyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in scale-in duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Access Denied
                  </h3>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  You are not registered as an active member of this company in the workspace. To access and manage spreadsheets, you need a member profile. Would you like to create one and join now?
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinCompanyModal(false);
                    }}
                    className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl hover:bg-slate-200 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSelfJoin}
                    disabled={joining}
                    className="flex-1 bg-gradient-to-br from-[#191970] to-[#2277ff] text-white font-bold py-3 rounded-2xl hover:brightness-110 shadow-lg shadow-indigo-600/10 transition disabled:opacity-50"
                  >
                    {joining ? "Joining..." : "Create Profile & Join"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Unsaved Changes Exit Confirmation Modal */}
          {showExitModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-slate-950/60 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in scale-in duration-200">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unsaved Changes</h3>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Any unsaved changes will be lost. Return to dashboard?
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleExitEditor("cancel")}
                    className="w-full sm:flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl hover:bg-slate-200 dark:bg-slate-850 dark:text-slate-350 dark:hover:bg-slate-800 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExitEditor("discard")}
                    className="w-full sm:flex-1 bg-rose-50 text-rose-600 font-bold py-3 rounded-2xl hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-450 dark:hover:bg-rose-900/20 transition text-sm"
                  >
                    Discard & Exit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExitEditor("save")}
                    disabled={saving}
                    className="w-full sm:flex-1 bg-gradient-to-br from-[#191970] to-[#2277ff] text-white font-bold py-3 rounded-2xl hover:brightness-110 shadow-lg shadow-indigo-600/10 transition disabled:opacity-50 text-sm flex items-center justify-center gap-1.5"
                  >
                    {saving ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Save & Exit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
