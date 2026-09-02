import { createWorker } from 'tesseract.js';

export interface OCRScanResult {
  rawText: string;
  extractedName?: string;
  extractedNumber?: string;
  extractedSet?: string;
}

export const ocrService = {
  /**
   * Run OCR on a given image (data URL, blob, or HTMLCanvasElement)
   */
  async scanCardImage(imageSource: string | HTMLCanvasElement | Blob): Promise<OCRScanResult> {
    try {
      const worker = await createWorker('eng'); // 'eng' works great for alphanumeric card titles and numbers
      
      const ret = await worker.recognize(imageSource);
      await worker.terminate();

      const text = ret.data.text || '';
      return this.parseCardText(text);
    } catch (error) {
      console.error('OCR Processing error:', error);
      return { rawText: '' };
    }
  },

  /**
   * Parse extracted OCR lines to identify candidate Pokémon names and card numbers
   */
  parseCardText(rawText: string): OCRScanResult {
    const lines = rawText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 2);

    let extractedName = '';
    let extractedNumber = '';
    let extractedSet = '';

    // Regex for card numbers like 017/071, 043/165, SV2D, etc.
    const numberPattern = /(\d{2,3})\s*[\/|]\s*(\d{2,3})/i;
    const setPattern = /(SV\d+[a-z]?|CS\d+[a-z]?|S\d+[a-z]?)/i;

    for (const line of lines) {
      // Find card number (e.g., 017/071)
      const numMatch = line.match(numberPattern);
      if (numMatch && !extractedNumber) {
        extractedNumber = numMatch[1];
      }

      // Find Set ID if printed (e.g. SV2D)
      const setMatch = line.match(setPattern);
      if (setMatch && !extractedSet) {
        extractedSet = setMatch[1].toUpperCase();
      }

      // Clean line for card name candidate (usually top lines with words, not pure numbers or stats)
      const cleanLine = line.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
      if (!extractedName && cleanLine.length >= 3 && !cleanLine.toLowerCase().includes('hp') && !cleanLine.toLowerCase().includes('pokemon') && !cleanLine.toLowerCase().includes('basic')) {
        // Exclude common card words
        const upperWords = cleanLine.split(' ').filter(w => w.length > 2);
        if (upperWords.length > 0) {
          extractedName = upperWords[0];
          if (upperWords.length > 1 && upperWords[1].toLowerCase() === 'ex') {
            extractedName += ' ex';
          }
        }
      }
    }

    return {
      rawText,
      extractedName: extractedName || (lines.length > 0 ? lines[0] : undefined),
      extractedNumber,
      extractedSet
    };
  }
};
