import { DrawingData, TitleBlock, Dimensions, GDT } from '../types';
import { OCRResult } from './ocrService';

export function parseDrawingText(ocrResult: OCRResult): DrawingData {
  const text = ocrResult.text.toUpperCase();
  const lines = ocrResult.lines.map(l => l.text.trim()).filter(l => l.length > 0);

  // Parse title block
  const titleBlock = parseTitleBlock(text, lines);

  // Parse notes
  const notes = parseNotes(lines);

  // Parse dimensions
  const dimensions = parseDimensions(text);

  // Parse views
  const views = parseViews(text);

  // Parse GD&T
  const gdAndT = parseGDT(text, lines);

  return {
    text: ocrResult.text,
    rawLines: lines,
    titleBlock,
    notes,
    dimensions,
    views,
    gdAndT,
    confidence: ocrResult.confidence,
  };
}

function parseTitleBlock(text: string, lines: string[]): TitleBlock {
  const titleBlock: TitleBlock = {};

  // Drawing number patterns
  const dwgPatterns = [
    /(?:DWG|DRAWING)\s*(?:NO|NUMBER|#)?\s*[:\s]*([A-Z0-9\-\/]+)/i,
    /DWG[:\s]+([A-Z0-9\-\/]+)/i,
  ];

  for (const pattern of dwgPatterns) {
    const match = text.match(pattern);
    if (match) {
      titleBlock.drawingNumber = match[1].trim();
      break;
    }
  }

  // Title pattern
  const titleMatch = text.match(/(?:TITLE|NAME)\s*[:\s]*([A-Z0-9\s]+?)(?:\n|$)/i);
  if (titleMatch) {
    titleBlock.title = titleMatch[1].trim();
  }

  // Scale pattern
  const scaleMatch = text.match(/SCALE\s*[:\s]*([0-9:\s]+?)(?:\s|$|\n)/i);
  if (scaleMatch) {
    titleBlock.scale = scaleMatch[1].trim();
  }

  // Date patterns
  const dateMatch = text.match(/(?:DATE|DRAWN)\s*[:\s]*([0-9\/\-]+\d{2,4})/i);
  if (dateMatch) {
    titleBlock.date = dateMatch[1].trim();
  }

  // Revision pattern
  const revMatch = text.match(/(?:REV|REVISION)\s*[:\s]*([A-Z0-9]+)/i);
  if (revMatch) {
    titleBlock.revision = revMatch[1].trim();
  }

  // Material pattern
  const materialMatch = text.match(/(?:MATERIAL|MATL?)\s*[:\s]*([A-Z0-9\s\-]+?)(?:\n|$)/i);
  if (materialMatch) {
    titleBlock.material = materialMatch[1].trim();
  }

  // Finish pattern
  const finishMatch = text.match(/(?:FINISH|FIN|SURFACE)\s*[:\s]*([A-Z0-9\s\-]+?)(?:\n|$)/i);
  if (finishMatch) {
    titleBlock.finish = finishMatch[1].trim();
  }

  // Units pattern
  if (text.includes('INCH') || text.includes('INCHES')) {
    titleBlock.units = 'INCHES';
  } else if (text.includes('MM') || text.includes('MILLIMETER')) {
    titleBlock.units = 'MILLIMETERS';
  }

  // Drawn by pattern
  const drawnMatch = text.match(/(?:DRAWN BY|DRAWN|BY)\s*[:\s]*([A-Z\.\s]+?)(?:\n|$)/i);
  if (drawnMatch) {
    titleBlock.drawnBy = drawnMatch[1].trim();
  }

  // Checked by pattern
  const checkedMatch = text.match(/(?:CHECKED|CHK)\s*[:\s]*([A-Z\.\s]+?)(?:\n|$)/i);
  if (checkedMatch) {
    titleBlock.checkedBy = checkedMatch[1].trim();
  }

  // Approved by pattern
  const approvedMatch = text.match(/(?:APPROVED|APP|ENG)\s*[:\s]*([A-Z\.\s]+?)(?:\n|$)/i);
  if (approvedMatch) {
    titleBlock.approvedBy = approvedMatch[1].trim();
  }

  // Sheet pattern
  const sheetMatch = text.match(/SHEET\s*[:\s]*([0-9\s]+OF\s*[0-9]+)/i);
  if (sheetMatch) {
    titleBlock.sheet = sheetMatch[1].trim();
  }

  return titleBlock;
}

function parseNotes(lines: string[]): string[] {
  const notes: string[] = [];
  let inNotesSection = false;

  for (const line of lines) {
    const upperLine = line.toUpperCase().trim();

    // Detect start of notes section
    if (upperLine.includes('NOTES') || upperLine.includes('NOTE:')) {
      inNotesSection = true;
      continue;
    }

    // End notes section on certain markers
    if (inNotesSection && (
      upperLine.includes('SECTION') ||
      upperLine.includes('DETAIL') ||
      upperLine.includes('VIEW') ||
      upperLine.match(/^[A-Z]\s*$/) // Single letter could be section marker
    )) {
      inNotesSection = false;
    }

    // Collect notes (numbered or bullet items)
    if (inNotesSection && line.trim().length > 5) {
      // Skip lines that appear to be dimensions or other content
      if (!line.match(/^[\d\.\s]+$/) && !line.match(/^[A-Z]\s+[A-Z]+$/)) {
        notes.push(line.trim());
      }
    }

    // Also capture any line containing typical note keywords
    const noteKeywords = ['REMOVE', 'SURFACE', 'MATERIAL', 'TOLERANCE', 'HEAT', 'FINISH', 'BURR', 'CHAMFER', 'ANODIZE', 'PLATE'];
    if (noteKeywords.some(kw => upperLine.includes(kw)) && line.length > 10) {
      if (!notes.includes(line.trim())) {
        notes.push(line.trim());
      }
    }
  }

  return [...new Set(notes)]; // Remove duplicates
}

function parseDimensions(text: string): Dimensions {
  const linear: Array<{ value: string; tolerance?: string; type: string }> = [];
  const angular: Array<{ value: string; tolerance?: string; type: string }> = [];
  const geometric: Array<{ symbol: string; value: string; datum?: string; type: string }> = [];

  // Linear dimensions - look for patterns like 2.500, 4.000, etc.
  const linearMatches = text.matchAll(/(\d+\.?\d*)\s*(?:["''\s]|IN)?/g);
  for (const match of linearMatches) {
    const value = match[1];
    if (parseFloat(value) > 0.01) { // Filter out very small matches
      // Look for tolerance nearby
      const toleranceMatch = text.substring(match.index! - 20, match.index! + 30)
        .match(/[+±]\s*[\d\.]+/);
      linear.push({
        value,
        tolerance: toleranceMatch ? toleranceMatch[0] : undefined,
        type: 'linear',
      });
    }
  }

  // Angular dimensions
  const angularMatches = text.matchAll(/(\d+)\s*°/g);
  for (const match of angularMatches) {
    angular.push({
      value: match[0],
      type: 'angular',
    });
  }

  // GD&T symbols (using text representations since OCR may not capture symbols perfectly)
  const gdtSymbols = ['PERP', 'PARALLEL', 'POSITION', 'CONCENTRICITY', 'CIRCULARITY', 'FLATNESS', 'CYLINDRICITY', 'PROFILE', 'RUNOUT', 'SYMMETRY'];
  const gdtPattern = new RegExp(`(${gdtSymbols.join('|')})\\s*[:\\s]*\\d+\\.?\\d*\\s*(?:@|AT)?\\s*([A-Z])?`, 'gi');

  const gdtMatches = text.matchAll(gdtPattern);
  for (const match of gdtMatches) {
    if (match[1] && match[0]) {
      // Find the value in the match
      const valueMatch = match[0].match(/[\d\.]+/);
      geometric.push({
        symbol: match[1].toUpperCase(),
        value: valueMatch ? valueMatch[0] : '',
        datum: match[2],
        type: match[1].toLowerCase(),
      });
    }
  }

  return { linear, angular, geometric };
}

function parseViews(text: string): string[] {
  const views: string[] = [];

  // Common view patterns
  const viewPatterns = [
    /FRONT\s*VIEW/i,
    /TOP\s*VIEW/i,
    /SIDE\s*VIEW/i,
    /RIGHT\s*VIEW/i,
    /LEFT\s*VIEW/i,
    /BOTTOM\s*VIEW/i,
    /REAR\s*VIEW/i,
    /BACK\s*VIEW/i,
    /ISO\s*VIEW/i,
    /SECTION\s*[A-Z]\s*[-–]\s*[A-Z]/gi,
    /DETAIL\s*[A-Z]/gi,
  ];

  for (const pattern of viewPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => {
        if (!views.includes(m.toUpperCase())) {
          views.push(m.toUpperCase());
        }
      });
    }
  }

  return views;
}

function parseGDT(text: string, lines: string[]): GDT {
  const datums: string[] = [];
  const modifiers: string[] = [];
  let featureControlFrames = 0;

  // Find datum references
  const datumMatches = text.matchAll(/DATUM\s*([A-Z])|([A-Z])\s*(?:DATUM)?/gi);
  for (const match of datumMatches) {
    const datum = match[1] || match[2];
    if (datum && !datums.includes(datum.toUpperCase())) {
      datums.push(datum.toUpperCase());
    }
  }

  // Also look for simple datum letter references
  const simpleDatums = text.matchAll(/(?<![A-Z])([A-C])(?![A-Z])/g);
  for (const match of simpleDatums) {
    if (!datums.includes(match[1])) {
      datums.push(match[1]);
    }
  }

  // Find modifiers
  if (text.includes('MMC') || text.includes('MAX MATERIAL') || text.includes('Ⓜ') || text.includes('M')) {
    modifiers.push('M');
  }
  if (text.includes('LMC') || text.includes('LEAST MATERIAL') || text.includes('Ⓛ') || text.includes('L')) {
    modifiers.push('L');
  }
  if (text.includes('RFS') || text.includes('REGARDLESS')) {
    modifiers.push('S');
  }

  // Count feature control frames by looking for GD&T keywords
  const gdtKeywords = ['POSITION', 'PERPENDICULARITY', 'PARALLELISM', 'ANGULARITY',
                       'FLATNESS', 'CIRCULARITY', 'CYLINDRICITY', 'PROFILE', 'RUNOUT'];
  for (const keyword of gdtKeywords) {
    const matches = text.match(new RegExp(keyword, 'gi'));
    if (matches) {
      featureControlFrames += matches.length;
    }
  }

  // Also check for symbol representations
  const symbols = text.match(/[⊥|⌖|⏥|○|⌭|⏢|⌰|⌯|⌓]/g);
  if (symbols) {
    featureControlFrames += symbols.length;
  }

  return {
    featureControlFrames,
    datums: datums.slice(0, 6), // Limit to 6 datums max
    modifiers: [...new Set(modifiers)],
  };
}
