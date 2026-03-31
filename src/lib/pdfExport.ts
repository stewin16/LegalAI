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

const stripControlChars = (value: string) =>
  Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return (code >= 32 && code !== 127) || char === "\n" || char === "\t";
    })
    .join("");

const sanitizeText = (value: string) =>
  stripControlChars((value || "")
    .replace(/\r\n/g, "\n")
    .trim());

export const toPlainText = (value: string) =>
  sanitizeText(value)
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ""))
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)")
    .replace(/^[-*+]\s+/gm, "- ");

const safeFileName = (value: string) =>
  Array.from(value)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code < 32 || code === 127) return "_";
      if ('<>:"/\\|?*'.includes(char)) return "_";
      return char;
    })
    .join("")
    .replace(/\s+/g, "_");

// Helper for page overflow check
const checkYOverflow = (y: number, padding: number): boolean => {
  return y + padding > 800; // A4 height is ~841pt
};

export const exportStructuredPdf = async (options: ExportStructuredPdfOptions) => {
  const { title, fileName, metadata = [], sections, footer } = options;
  
  // Prepare Filenaming
  const cleanName = fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  const secureFileName = safeFileName(cleanName);

  try {
    const doc = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: "a4",
      compress: true
    });

    let currentY = 50;
    const margin = 45;
    const pageWidth = 505; // ~595 - (2*45)

    // Header Branding
    doc.setDrawColor(255, 153, 51); // Saffron
    doc.setLineWidth(2);
    doc.line(margin, currentY, margin + pageWidth, currentY);
    currentY += 15;

    doc.setTextColor(0, 0, 128); // Navy
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("LEGALAI INDIA", margin, currentY);
    
    doc.setTextColor(153, 153, 153);
    doc.setFontSize(8);
    doc.text("OFFICIAL REPORT • " + new Date().toLocaleDateString(), margin + pageWidth, currentY, { align: "right" });
    
    currentY += 25;

    // Title
    doc.setTextColor(0, 0, 128);
    doc.setFontSize(22);
    const titleLines = doc.splitTextToSize(toPlainText(title), pageWidth);
    doc.text(titleLines, margin, currentY);
    currentY += (titleLines.length * 24) + 15;

    // Metadata
    if (metadata.length > 0) {
      doc.setDrawColor(221, 221, 221);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, margin + pageWidth, currentY);
      currentY += 15;
      
      doc.setTextColor(102, 102, 102);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      
      metadata.forEach(m => {
        if (checkYOverflow(currentY, 12)) { doc.addPage(); currentY = 40; }
        doc.text(toPlainText(m), margin, currentY);
        currentY += 12;
      });
      currentY += 10;
    }

    // Sections
    sections.forEach(s => {
      if (s.label) {
        if (checkYOverflow(currentY, 20)) { doc.addPage(); currentY = 45; }
        doc.setTextColor(34, 34, 34);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(toPlainText(s.label), margin, currentY);
        currentY += 15;
      }

      doc.setTextColor(85, 85, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const textLines = doc.splitTextToSize(toPlainText(s.text), pageWidth);
      
      textLines.forEach((line: string) => {
        if (checkYOverflow(currentY, 14)) { 
          doc.addPage(); 
          doc.setDrawColor(255, 153, 51);
          doc.line(margin, 30, margin + pageWidth, 30);
          currentY = 45;
        }
        doc.text(line, margin, currentY);
        currentY += 14;
      });
      currentY += 20;
    });

    // Footer
    if (footer) {
      if (checkYOverflow(currentY, 40)) { doc.addPage(); currentY = 45; }
      doc.setDrawColor(238, 238, 238);
      doc.line(margin, currentY, margin + pageWidth, currentY);
      currentY += 15;
      doc.setTextColor(153, 153, 153);
      doc.setFontSize(8);
      doc.text(toPlainText(footer), margin, currentY, { maxWidth: pageWidth });
    }

    doc.save(secureFileName);

  } catch (error) {
    console.error("PDF Engine Crash:", error);
    alert("Generation failed. Please try again or copy text manually.");
  }
};
