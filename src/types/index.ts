export interface TitleBlock {
  drawingNumber?: string;
  title?: string;
  drawnBy?: string;
  checkedBy?: string;
  approvedBy?: string;
  date?: string;
  scale?: string;
  material?: string;
  finish?: string;
  revision?: string;
  sheet?: string;
  units?: string;
  [key: string]: string | undefined;
}

export interface Dimension {
  value: string;
  tolerance?: string;
  type: string;
  datum?: string;
}

export interface Dimensions {
  linear: Dimension[];
  angular: Dimension[];
  geometric: Dimension[];
}

export interface GDT {
  featureControlFrames: number;
  datums: string[];
  modifiers: string[];
}

export interface DrawingData {
  text?: string;
  rawLines?: string[];
  titleBlock: TitleBlock;
  notes: string[];
  dimensions: Dimensions;
  views: string[];
  gdAndT: GDT;
  confidence?: number;
  fileName?: string;
  fileSize?: number;
}

export interface ValidationResult {
  id: string;
  category: 'title_block' | 'spelling' | 'asme_compliance' | 'dimensions' | 'gd&t' | 'general';
  severity: 'error' | 'warning' | 'info';
  message: string;
  standard: string;
  suggestion: string;
  context?: string;
}

export type ValidationSeverity = 'error' | 'warning' | 'info';
