// src/utils/documentExport.ts

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';

// Type for text segments with formatting
interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

// Type for parsed markdown elements
interface MarkdownElement {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'bold' | 'list';
  text: string;
  segments?: TextSegment[];
}

/**
 * Parse inline markdown formatting (bold, italic) into segments
 * Handles: **bold**, *italic*, ***bold italic***, __bold__, _italic_
 */
function parseInlineFormatting(text: string): TextSegment[] {
  const segments: TextSegment[] = [];

  // Remove code blocks from processing (keep them as plain text)
  const cleanText = text.replace(/`([^`]+)`/g, '$1');

  // Regex to match bold and italic patterns
  // Order matters: check bold+italic first, then bold, then italic
  const regex = /(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*|___([^_]+)___|__([^_]+)__|_([^_]+)_)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(cleanText)) !== null) {
    // Add text before the match as plain text
    if (match.index > lastIndex) {
      const plainText = cleanText.slice(lastIndex, match.index);
      if (plainText) {
        segments.push({ text: plainText });
      }
    }

    // Determine the type of formatting
    if (match[2]) {
      // ***bold italic***
      segments.push({ text: match[2], bold: true, italic: true });
    } else if (match[3]) {
      // **bold**
      segments.push({ text: match[3], bold: true });
    } else if (match[4]) {
      // *italic*
      segments.push({ text: match[4], italic: true });
    } else if (match[5]) {
      // ___bold italic___
      segments.push({ text: match[5], bold: true, italic: true });
    } else if (match[6]) {
      // __bold__
      segments.push({ text: match[6], bold: true });
    } else if (match[7]) {
      // _italic_
      segments.push({ text: match[7], italic: true });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < cleanText.length) {
    const remainingText = cleanText.slice(lastIndex);
    if (remainingText) {
      segments.push({ text: remainingText });
    }
  }

  // If no formatting was found, return the whole text as a single segment
  if (segments.length === 0) {
    return [{ text: cleanText }];
  }

  return segments;
}

/**
 * Strip all markdown formatting from text (for plain text output)
 */
function stripMarkdownFormatting(text: string): string {
  return text
    // Remove bold italic (***text*** or ___text___)
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/___([^_]+)___/g, '$1')
    // Remove bold (**text** or __text__)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function parseMarkdownToElements(markdown: string): MarkdownElement[] {
  const lines = markdown.split('\n');
  const elements: MarkdownElement[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip JSON code blocks entirely
    if (trimmed.startsWith('```')) continue;
    if (trimmed.startsWith('{') || trimmed.startsWith('}')) continue;

    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4);
      elements.push({
        type: 'h3',
        text: stripMarkdownFormatting(text),
        segments: parseInlineFormatting(text)
      });
    } else if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3);
      elements.push({
        type: 'h2',
        text: stripMarkdownFormatting(text),
        segments: parseInlineFormatting(text)
      });
    } else if (trimmed.startsWith('# ')) {
      const text = trimmed.slice(2);
      elements.push({
        type: 'h1',
        text: stripMarkdownFormatting(text),
        segments: parseInlineFormatting(text)
      });
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
      // Whole line is bold
      const text = trimmed.slice(2, -2);
      elements.push({
        type: 'bold',
        text: stripMarkdownFormatting(text),
        segments: [{ text: stripMarkdownFormatting(text), bold: true }]
      });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.slice(2);
      elements.push({
        type: 'list',
        text: stripMarkdownFormatting(text),
        segments: parseInlineFormatting(text)
      });
    } else if (trimmed.match(/^\d+\.\s/)) {
      const text = trimmed.replace(/^\d+\.\s/, '');
      elements.push({
        type: 'list',
        text: stripMarkdownFormatting(text),
        segments: parseInlineFormatting(text)
      });
    } else {
      const text = trimmed;
      elements.push({
        type: 'p',
        text: stripMarkdownFormatting(text),
        segments: parseInlineFormatting(text)
      });
    }
  }

  return elements;
}

/**
 * Convert parsed segments to DOCX TextRuns with proper formatting
 */
function segmentsToTextRuns(segments: TextSegment[] | undefined, defaultText: string): TextRun[] {
  if (!segments || segments.length === 0) {
    return [new TextRun(defaultText)];
  }

  return segments.map(seg => new TextRun({
    text: seg.text,
    bold: seg.bold,
    italics: seg.italic,
  }));
}

export async function exportToDocx(content: string, filename: string): Promise<void> {
  const elements = parseMarkdownToElements(content);

  const children = elements.map(el => {
    switch (el.type) {
      case 'h1':
        return new Paragraph({
          children: segmentsToTextRuns(el.segments, el.text),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        });
      case 'h2':
        return new Paragraph({
          children: segmentsToTextRuns(el.segments, el.text),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        });
      case 'h3':
        return new Paragraph({
          children: segmentsToTextRuns(el.segments, el.text),
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
          children: [
            new TextRun({ text: '• ' }),
            ...segmentsToTextRuns(el.segments, el.text)
          ],
          spacing: { before: 50, after: 50 },
        });
      default:
        return new Paragraph({
          children: segmentsToTextRuns(el.segments, el.text),
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
    // Check for page break
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    let fontSize: number;
    let fontStyle: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal';
    let extraSpaceBefore = 0;

    switch (el.type) {
      case 'h1':
        fontSize = 18;
        fontStyle = 'bold';
        extraSpaceBefore = 5;
        break;
      case 'h2':
        fontSize = 14;
        fontStyle = 'bold';
        extraSpaceBefore = 3;
        break;
      case 'h3':
        fontSize = 12;
        fontStyle = 'bold';
        extraSpaceBefore = 2;
        break;
      case 'bold':
        fontSize = 11;
        fontStyle = 'bold';
        break;
      case 'list':
        fontSize = 11;
        fontStyle = 'normal';
        break;
      default:
        fontSize = 11;
        fontStyle = 'normal';
    }

    y += extraSpaceBefore;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);

    // Use cleaned text (el.text) for all elements - markdown formatting already stripped
    const text = el.type === 'list' ? `• ${el.text}` : el.text;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, marginLeft, y);
    y += lines.length * (fontSize * 0.5) + 4;
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
