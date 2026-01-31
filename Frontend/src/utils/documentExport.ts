// src/utils/documentExport.ts

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';

function parseMarkdownToElements(markdown: string) {
  const lines = markdown.split('\n');
  const elements: Array<{ type: 'h1' | 'h2' | 'h3' | 'p' | 'bold' | 'list'; text: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('### ')) {
      elements.push({ type: 'h3', text: trimmed.slice(4) });
    } else if (trimmed.startsWith('## ')) {
      elements.push({ type: 'h2', text: trimmed.slice(3) });
    } else if (trimmed.startsWith('# ')) {
      elements.push({ type: 'h1', text: trimmed.slice(2) });
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push({ type: 'bold', text: trimmed.slice(2, -2) });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push({ type: 'list', text: trimmed.slice(2) });
    } else if (trimmed.match(/^\d+\.\s/)) {
      elements.push({ type: 'list', text: trimmed.replace(/^\d+\.\s/, '') });
    } else {
      // Handle inline bold
      const processed = trimmed.replace(/\*\*([^*]+)\*\*/g, '$1');
      elements.push({ type: 'p', text: processed });
    }
  }

  return elements;
}

export async function exportToDocx(content: string, filename: string): Promise<void> {
  const elements = parseMarkdownToElements(content);

  const children = elements.map(el => {
    switch (el.type) {
      case 'h1':
        return new Paragraph({
          text: el.text,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        });
      case 'h2':
        return new Paragraph({
          text: el.text,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        });
      case 'h3':
        return new Paragraph({
          text: el.text,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        });
      case 'bold':
        return new Paragraph({
          children: [new TextRun({ text: el.text, bold: true })],
          spacing: { before: 100, after: 100 },
        });
      case 'list':
        return new Paragraph({
          children: [new TextRun({ text: `• ${el.text}` })],
          spacing: { before: 50, after: 50 },
        });
      default:
        return new Paragraph({
          children: [new TextRun(el.text)],
          spacing: { before: 100, after: 100 },
        });
    }
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${filename}.docx`);
}

export function exportToPdf(content: string, filename: string): void {
  const doc = new jsPDF();
  const elements = parseMarkdownToElements(content);

  let y = 20;
  const marginLeft = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - 40;

  for (const el of elements) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    switch (el.type) {
      case 'h1':
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        y += 5;
        break;
      case 'h2':
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        y += 3;
        break;
      case 'h3':
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        y += 2;
        break;
      case 'bold':
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        break;
      case 'list':
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        break;
      default:
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
    }

    const text = el.type === 'list' ? `• ${el.text}` : el.text;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, marginLeft, y);
    y += lines.length * 6 + 4;
  }

  doc.save(`${filename}.pdf`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
