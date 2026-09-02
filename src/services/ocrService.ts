import { createWorker } from 'tesseract.js';

export interface OCRScanResult {
  rawText: string;
  cleanedName: string;
  extractedNumber?: string;
  extractedSet?: string;
  allLines: string[];
}

// Common Pokémon card header noise words to filter out when searching for title
const NOISE_WORDS = [
  'pokemon', 'pokémon', 'trainer', 'tool', 'item', 'supporter', 'stadium', 
  'basic', 'stage', 'vstar', 'vmax', 'energy', 'energi', 'kartu', 'bantuan',
  'aturan', 'rule', 'hp', 'weakness', 'resistance', 'retreat', 'biaya'
];

export const ocrService = {
  /**
   * Preprocess canvas image: grayscale, contrast stretching, and thresholding
   */
  preprocessCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = sourceCanvas.width * 2; // 2x supersampling for high OCR sharpness
    outputCanvas.height = sourceCanvas.height * 2;

    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return sourceCanvas;

    // Draw scaled up
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceCanvas, 0, 0, outputCanvas.width, outputCanvas.height);

    const imgData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = imgData.data;

    // High-contrast Grayscale & Binarization
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Grayscale luminance
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      // Dynamic Contrast Stretch
      let contrast = (gray - 128) * 1.6 + 128;
      contrast = Math.max(0, Math.min(255, contrast));

      // Binarize text threshold
      const finalVal = contrast > 135 ? 255 : (contrast < 90 ? 0 : contrast);

      data[i] = finalVal;
      data[i + 1] = finalVal;
      data[i + 2] = finalVal;
    }

    ctx.putImageData(imgData, 0, 0);
    return outputCanvas;
  },

  /**
   * Run OCR on a specific card region (e.g. Card Title Zone or Full Card)
   */
  async scanCardImage(imageSource: HTMLCanvasElement | Blob | string): Promise<OCRScanResult> {
    let worker: any = null;
    try {
      worker = await createWorker('eng');
      
      let targetSource: any = imageSource;
      if (imageSource instanceof HTMLCanvasElement) {
        targetSource = this.preprocessCanvas(imageSource);
      }

      const ret = await worker.recognize(targetSource);
      await worker.terminate();
      worker = null;

      const text = ret.data.text || '';
      return this.parseCardText(text);
    } catch (error) {
      console.error('OCR Processing error:', error);
      if (worker) {
        try { await worker.terminate(); } catch {}
      }
      return { rawText: '', cleanedName: '', allLines: [] };
    }
  },

  /**
   * Intelligently extract card name, number, and set codes from raw OCR text
   */
  parseCardText(rawText: string): OCRScanResult {
    const rawLines = rawText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length >= 2);

    let extractedNumber = '';
    let extractedSet = '';
    const cleanCandidateLines: string[] = [];

    // Regex for card numbers like 162/193, 017/071, 043/165
    const numberPattern = /(\d{1,3})\s*[\/|\\|I|l]\s*(\d{2,3})/i;
    const setPattern = /(SV\d+[a-z]?|CS\d+[a-z]?|M\d+[a-z]?|S\d+[a-z]?)/i;

    for (const line of rawLines) {
      // Find card number
      const numMatch = line.match(numberPattern);
      if (numMatch && !extractedNumber) {
        extractedNumber = numMatch[1];
      }

      // Find Set ID if visible
      const setMatch = line.match(setPattern);
      if (setMatch && !extractedSet) {
        extractedSet = setMatch[1].toUpperCase();
      }

      // Clean line from symbols
      const cleanLine = line
        .replace(/[^a-zA-Z0-9\s'-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanLine.length >= 3) {
        // Check if line is not just noise words
        const words = cleanLine.split(' ');
        const nonNoiseWords = words.filter(
          w => !NOISE_WORDS.includes(w.toLowerCase()) && isNaN(Number(w))
        );

        if (nonNoiseWords.length > 0) {
          cleanCandidateLines.push(cleanLine);
        }
      }
    }

    // Best candidate name: first line with substantive card title words
    let bestName = '';
    for (const candidate of cleanCandidateLines) {
      // Strip leading noise words like "Pokémon Tool", "Trainer", "Item"
      const words = candidate.split(' ');
      const titleWords = words.filter(w => !NOISE_WORDS.includes(w.toLowerCase()));
      if (titleWords.length > 0) {
        bestName = titleWords.join(' ');
        break;
      }
    }

    if (!bestName && cleanCandidateLines.length > 0) {
      bestName = cleanCandidateLines[0];
    }

    return {
      rawText,
      cleanedName: bestName,
      extractedNumber,
      extractedSet,
      allLines: cleanCandidateLines
    };
  }
};
