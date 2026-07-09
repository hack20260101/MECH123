import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
  lines: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

export async function performOCR(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  const result = await Tesseract.recognize(file, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  return {
    text: result.data.text,
    confidence: result.data.confidence,
    words: result.data.words?.map((w: any) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: w.bbox,
    })) || [],
    lines: result.data.lines?.map((l: any) => ({
      text: l.text,
      confidence: l.confidence,
      bbox: l.bbox,
    })) || [],
  };
}
