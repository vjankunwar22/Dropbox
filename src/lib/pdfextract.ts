import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs/promises';

export async function extractPdfTextWithPdfjs(filePath: string): Promise<string> {
  const fileData = await fs.readFile(filePath);
  const data = new Uint8Array(fileData);

  // Load PDF
  const pdfDocument = await pdfjsLib.getDocument({ data }).promise;

  let text = '';
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text.trim();
}
