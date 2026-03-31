import jsPDF from "jspdf";

type PdfSection = {
  label?: string;
  text: string;
};

type ExportStructuredPdfOptions = {
  title: string;
  fileName: string;
  metadata?: string[];
  sections: PdfSection[];
  footer?: string;
};

const preparePdfText = (str: string) => {
  if (!str) return "";
  return str
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/₹/g, "Rs.")
    .replace(/[•●■]/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();
};

export const toPlainText = (value: string) => {
  if (!value) return "";
  const plain = value
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ""))
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "- ");

  return preparePdfText(plain);
};

const safeFileName = (value: string) => {
    const name = (value || "report").replace(/\s+/g, "_");
    const clean = name.replace(/[<>:"/\\|?*]/g, "_");
    return clean.endsWith(".pdf") ? clean : `${clean}.pdf`;
};

const PAGE_HEIGHT = 842; // A4 in points
const MARGIN = 45;
const PAGE_WIDTH = 505;
const OVERFLOW_LIMIT = 780;

export const exportStructuredPdf = async (options: ExportStructuredPdfOptions) => {
  const { title, fileName, metadata = [], sections, footer } = options;
  const secureFileName = safeFileName(fileName);

  try {
    const doc = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: "a4"
    });

    let currentY = 50;

    // BRANDING HEADER
    doc.setDrawColor(255, 153, 51);
    doc.setLineWidth(2.5);
    doc.line(MARGIN, currentY, MARGIN + PAGE_WIDTH, currentY);
    currentY += 15;

    doc.setTextColor(0, 0, 128);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("LEGALAI INDIA", MARGIN, currentY);
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("OFFICIAL REPORT • " + new Date().toLocaleDateString(), MARGIN + PAGE_WIDTH, currentY, { align: "right" });
    currentY += 30;

    // TITLE
    doc.setTextColor(0, 0, 128);
    doc.setFontSize(22);
    const titleLines = doc.splitTextToSize(toPlainText(title), PAGE_WIDTH);
    titleLines.forEach((l: string) => {
      if (currentY > OVERFLOW_LIMIT) { doc.addPage(); currentY = 50; }
      doc.text(l, MARGIN, currentY);
      currentY += 26;
    });
    currentY += 10;

    // METADATA
    if (metadata.length > 0) {
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, currentY, MARGIN + PAGE_WIDTH, currentY);
      currentY += 18;
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      
      metadata.forEach(m => {
        const mLines = doc.splitTextToSize(toPlainText(m), PAGE_WIDTH);
        mLines.forEach((l: string) => {
          if (currentY > OVERFLOW_LIMIT) { doc.addPage(); currentY = 50; }
          doc.text(l, MARGIN, currentY);
          currentY += 13;
        });
      });
      currentY += 15;
    }

    // CONTENT SECTIONS
    sections.forEach(s => {
      if (s.label) {
        if (currentY > OVERFLOW_LIMIT - 30) { doc.addPage(); currentY = 50; }
        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(toPlainText(s.label), MARGIN, currentY);
        currentY += 18;
      }

      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const lines = doc.splitTextToSize(toPlainText(s.text), PAGE_WIDTH);
      
      lines.forEach((l: string) => {
        if (currentY > OVERFLOW_LIMIT) { 
          doc.addPage(); 
          currentY = 50;
          doc.setDrawColor(255, 153, 51);
          doc.line(MARGIN, 35, MARGIN + PAGE_WIDTH, 35);
        }
        doc.text(l, MARGIN, currentY);
        currentY += 14;
      });
      currentY += 18;
    });

    // FOOTER
    if (footer) {
      if (currentY > OVERFLOW_LIMIT - 40) { doc.addPage(); currentY = 50; }
      doc.setDrawColor(240, 240, 240);
      doc.line(MARGIN, currentY, MARGIN + PAGE_WIDTH, currentY);
      currentY += 15;
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(8);
      const fLines = doc.splitTextToSize(toPlainText(footer), PAGE_WIDTH);
      fLines.forEach((fl: string) => {
        doc.text(fl, MARGIN, currentY);
        currentY += 10;
      });
    }

    // BULLETPROOF DOWNLOAD METHOD
    // Instead of doc.save(), we generate a blob and trigger a manual click
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = secureFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error("PDF Export Crash:", err);
    alert("Generation failed. Please copy the text manually.");
  }
};
