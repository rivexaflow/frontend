import { PdfEditorView } from "@/features/workspace/views/pdf-editor-view";

export const metadata = {
  title: "PDF Template Editor — RivexaFlow",
  description: "Construct custom PDFs from block components, verify layouts, and merge documents",
};

export default function PdfEditorPage() {
  return <PdfEditorView />;
}
