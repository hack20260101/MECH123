import { useState, useCallback } from 'react';
import { FileUp, AlertCircle, CheckCircle2, Info, Settings, FileText, Shield, Brain } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ValidationResults from './components/ValidationResults';
import TitleBlockValidation from './components/TitleBlockValidation';
import SpellingValidation from './components/SpellingValidation';
import ASMECompliance from './components/ASMECompliance';
import ValidationSummary from './components/ValidationSummary';
import { performOCR } from './services/ocrService';
import { parseDrawingText } from './services/drawingParser';
import { ValidationResult, DrawingData } from './types';

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<DrawingData | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'results' | 'summary'>('upload');
  const [rawText, setRawText] = useState<string>('');

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    setOcrProgress(0);
    setActiveTab('results');

    try {
      // Perform real OCR
      const ocrResult = await performOCR(file, (progress) => {
        setOcrProgress(progress);
      });

      setRawText(ocrResult.text);

      // Parse the OCR results
      const drawingData = parseDrawingText(ocrResult);
      drawingData.fileName = file.name;
      drawingData.fileSize = file.size;

      setExtractedData(drawingData);

      // Generate validation results based on actual data
      const results = runValidation(drawingData);
      setValidationResults(results);
    } catch (error) {
      console.error('OCR Error:', error);
      // Create empty data structure on error
      const emptyData: DrawingData = {
        titleBlock: {},
        notes: [],
        dimensions: { linear: [], angular: [], geometric: [] },
        views: [],
        gdAndT: { featureControlFrames: 0, datums: [], modifiers: [] },
        fileName: file.name,
        fileSize: file.size,
      };
      setExtractedData(emptyData);
      setValidationResults([
        {
          id: 'err-001',
          category: 'general',
          severity: 'error',
          message: 'Failed to extract text from document. Please ensure the image is clear and readable.',
          standard: 'System',
          suggestion: 'Try uploading a clearer image or check file format',
        },
      ]);
    }

    setIsProcessing(false);
  }, []);

  const runValidation = (data: DrawingData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Title Block Validation - only check what was actually found
    const criticalFields = [
      { key: 'drawingNumber', name: 'Drawing Number' },
      { key: 'scale', name: 'Scale' },
      { key: 'units', name: 'Units' },
    ];

    criticalFields.forEach((field) => {
      if (!data.titleBlock[field.key]) {
        results.push({
          id: `tb-${field.key}`,
          category: 'title_block',
          severity: 'warning',
          message: `${field.name} not detected in title block`,
          standard: 'ASME Y14.1',
          suggestion: `Add or ensure ${field.name.toLowerCase()} is clearly visible in the title block`,
        });
      }
    });

    // Title block completeness
    const totalFields = Object.keys(data.titleBlock).filter(k => data.titleBlock[k as keyof typeof data.titleBlock]).length;
    if (totalFields > 0) {
      results.push({
        id: 'tb-info',
        category: 'title_block',
        severity: 'info',
        message: `Detected ${totalFields} title block field${totalFields > 1 ? 's' : ''}`,
        standard: 'ASME Y14.1',
        suggestion: 'Good practice maintained',
      });
    }

    // Spelling Validation - check notes for common misspellings
    data.notes.forEach((note, idx) => {
      const upperNote = note.toUpperCase();
      const spellingErrors: { [key: string]: string } = {
        'OTHRWISE': 'OTHERWISE',
        'REQIRED': 'REQUIRED',
        'MATERAIL': 'MATERIAL',
        'TOLERENCE': 'TOLERANCE',
        'DIMENTION': 'DIMENSION',
        'ASSEMLY': 'ASSEMBLY',
        'SURFCE': 'SURFACE',
        'FINSH': 'FINISH',
        'THRAD': 'THREAD',
        'HEATTRET': 'HEAT TREAT',
        'ANNODIZE': 'ANODIZE',
        'ANNODIZED': 'ANODIZED',
        'PARALELL': 'PARALLEL',
        'PERPINDICULAR': 'PERPENDICULAR',
        'DATTUM': 'DATUM',
        'MEASURMENT': 'MEASUREMENT',
      };

      Object.entries(spellingErrors).forEach(([error, correct]) => {
        if (upperNote.includes(error)) {
          results.push({
            id: `sp-${idx}-${error}`,
            category: 'spelling',
            severity: 'warning',
            message: `Possible spelling error: "${error}" should be "${correct}"`,
            standard: 'Drawing Quality',
            suggestion: `Correct spelling to "${correct}"`,
            context: note,
          });
        }
      });
    });

    // ASME Y14.5 Compliance Checks
    if (data.views.length > 0 && data.views.length < 3) {
      results.push({
        id: 'asme-views',
        category: 'asme_compliance',
        severity: 'warning',
        message: `Only ${data.views.length} view${data.views.length > 1 ? 's' : ''} detected`,
        standard: 'ASME Y14.5-2018 Section 2',
        suggestion: 'Add front, top, and right-side views for complete part definition',
      });
    } else if (data.views.length >= 3) {
      results.push({
        id: 'asme-views-ok',
        category: 'asme_compliance',
        severity: 'info',
        message: `${data.views.length} views detected`,
        standard: 'ASME Y14.5-2018',
        suggestion: 'Sufficient views for part definition',
      });
    }

    // GD&T Validation
    if (data.gdAndT.featureControlFrames > 0 && data.gdAndT.datums.length < 3) {
      results.push({
        id: 'asme-gdt',
        category: 'asme_compliance',
        severity: 'warning',
        message: `GD&T detected (${data.gdAndT.featureControlFrames} FCFs) but incomplete datum system`,
        standard: 'ASME Y14.5-2018 Section 3',
        suggestion: 'Define datums A, B, and C to establish complete datum reference frame',
      });
    } else if (data.gdAndT.featureControlFrames > 0) {
      results.push({
        id: 'asme-gdt-ok',
        category: 'asme_compliance',
        severity: 'info',
        message: `${data.gdAndT.featureControlFrames} GD&T feature control frame${data.gdAndT.featureControlFrames > 1 ? 's' : ''} detected`,
        standard: 'ASME Y14.5-2018',
        suggestion: 'GD&T usage detected per ASME standards',
      });
    }

    // Dimension validation
    const dimensionsWithoutTolerance = data.dimensions.linear.filter(d => !d.tolerance);
    if (dimensionsWithoutTolerance.length > 0 && data.dimensions.linear.length > 0) {
      results.push({
        id: 'dim-tol',
        category: 'dimensions',
        severity: 'warning',
        message: `${dimensionsWithoutTolerance.length} dimension${dimensionsWithoutTolerance.length > 1 ? 's' : ''} without explicit tolerance`,
        standard: 'ASME Y14.5-2018',
        suggestion: 'Specify tolerances or reference general tolerance block',
      });
    }

    if (data.dimensions.linear.length === 0 && data.dimensions.angular.length === 0) {
      results.push({
        id: 'dim-none',
        category: 'dimensions',
        severity: 'warning',
        message: 'No dimensions detected',
        standard: 'ASME Y14.5-2018',
        suggestion: 'Ensure dimensions are clearly visible in the drawing',
      });
    }

    if (data.notes.length === 0) {
      results.push({
        id: 'notes-none',
        category: 'general',
        severity: 'warning',
        message: 'No notes detected',
        standard: 'Drawing Quality',
        suggestion: 'Add general notes for material, finish, and other specifications',
      });
    }

    // OCR Confidence check
    if (data.confidence && data.confidence < 70) {
      results.push({
        id: 'ocr-conf',
        category: 'general',
        severity: 'warning',
        message: `Low OCR confidence (${Math.round(data.confidence)}%). Results may be incomplete.`,
        standard: 'System',
        suggestion: 'Upload a clearer image for better accuracy',
      });
    }

    return results;
  };

  const getErrorCount = () => validationResults.filter(r => r.severity === 'error').length;
  const getWarningCount = () => validationResults.filter(r => r.severity === 'warning').length;
  const getInfoCount = () => validationResults.filter(r => r.severity === 'info').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">DrawingValidation Pro</h1>
                <p className="text-xs text-slate-500">ASME Y14.5 Compliance Framework</p>
              </div>
            </div>
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'upload'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileUp className="w-4 h-4 inline mr-2" />
                Upload
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'results'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Results
                {validationResults.filter(r => r.severity !== 'info').length > 0 && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {validationResults.filter(r => r.severity !== 'info').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'summary'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                Summary
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Automated Engineering Drawing Validation
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Upload engineering drawings for instant ASME Y14.5 compliance validation,
                spelling checks, title block verification, and dimension analysis.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">ASME Y14.5 Compliance</h3>
                <p className="text-sm text-slate-600">
                  Validates GD&T, datums, tolerances, and dimensioning practices against ASME standards.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Title Block Validation</h3>
                <p className="text-sm text-slate-600">
                  Checks for required title block fields, formatting, and completeness per ASME Y14.1.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Spelling & Grammar</h3>
                <p className="text-sm text-slate-600">
                  Detects misspellings in notes, specifications, and annotations on the drawing.
                </p>
              </div>
            </div>

            {/* Upload Component */}
            <FileUpload onFileUpload={handleFileUpload} isProcessing={isProcessing} />
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            {validationResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200">
                  <div className="text-sm text-slate-600 mb-1">OCR Confidence</div>
                  <div className="text-3xl font-bold text-slate-900">
                    {extractedData?.confidence ? Math.round(extractedData.confidence) : 'N/A'}%
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-md border border-red-200 bg-red-50">
                  <div className="text-sm text-red-700 mb-1">Errors</div>
                  <div className="text-3xl font-bold text-red-600">{getErrorCount()}</div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-md border border-amber-200 bg-amber-50">
                  <div className="text-sm text-amber-700 mb-1">Warnings</div>
                  <div className="text-3xl font-bold text-amber-600">{getWarningCount()}</div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-md border border-blue-200 bg-blue-50">
                  <div className="text-sm text-blue-700 mb-1">Passed</div>
                  <div className="text-3xl font-bold text-blue-600">{getInfoCount()}</div>
                </div>
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Processing Drawing...</h3>
                  <p className="text-sm text-slate-600 mb-4">Extracting text using OCR</p>
                  <div className="w-64 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{ocrProgress}%</p>
                </div>
              </div>
            )}

            {/* Raw Text Preview */}
            {!isProcessing && rawText && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Extracted Text (OCR)
                </h3>
                <details className="group">
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                    View raw extracted text
                  </summary>
                  <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                      {rawText}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            {/* Results Components */}
            {extractedData && !isProcessing && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TitleBlockValidation titleBlock={extractedData.titleBlock} />
                <SpellingValidation
                  notes={extractedData.notes}
                  results={validationResults.filter(r => r.category === 'spelling')}
                />
                <ASMECompliance
                  data={extractedData}
                  results={validationResults.filter(r => r.category === 'asme_compliance' || r.category === 'dimensions' || r.category === 'gd&t')}
                />
                <ValidationResults results={validationResults.filter(r => r.category === 'title_block' || r.category === 'general')} title="Other Validation Results" />
              </div>
            )}

            {/* Empty State */}
            {!uploadedFile && !isProcessing && (
              <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200 text-center">
                <FileUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Drawing Uploaded</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Upload an engineering drawing to see validation results
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Upload Drawing
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <ValidationSummary
            data={extractedData}
            results={validationResults}
            file={uploadedFile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Built for GOH-UC-026 Hackathon - Automated Drawing Validation Framework
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Settings className="w-4 h-4" />
              <span>ASME Y14.5-2018 | ASME Y14.1</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
