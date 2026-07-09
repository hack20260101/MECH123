import { FileText, Download, Share2, CheckCircle2, AlertTriangle, AlertCircle, TrendingUp, Clock, Award, BarChart3 } from 'lucide-react';
import { DrawingData, ValidationResult } from '../types';

interface ValidationSummaryProps {
  data: DrawingData | null;
  results: ValidationResult[];
  file: File | null;
}

function ValidationSummary({ data, results, file }: ValidationSummaryProps) {
  const errors = results.filter(r => r.severity === 'error');
  const warnings = results.filter(r => r.severity === 'warning');
  const info = results.filter(r => r.severity === 'info');

  const errorCount = errors.length;
  const warningCount = warnings.length;
  const passedCount = info.length;

  // Calculate overall score based on actual findings
  const baseScore = 100;
  const errorPenalty = errorCount * 10;
  const warningPenalty = warningCount * 3;
  const overallScore = Math.max(0, baseScore - errorPenalty - warningPenalty + (passedCount * 2));

  const getGrade = (score: number) => {
    if (score >= 95) return { grade: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score >= 90) return { grade: 'A', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score >= 85) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 75) return { grade: 'C+', color: 'text-amber-600', bg: 'bg-amber-100' };
    if (score >= 70) return { grade: 'C', color: 'text-amber-600', bg: 'bg-amber-100' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const gradeInfo = getGrade(Math.min(overallScore, 100));

  // Calculate actual title block completeness
  const titleBlockFields = data?.titleBlock ? Object.keys(data.titleBlock).filter(
    k => data.titleBlock?.[k as keyof typeof data.titleBlock]
  ).length : 0;
  const titleBlockScore = titleBlockFields > 0 ? Math.min(100, titleBlockFields * 12 + 20) : 0;

  if (!file) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200 text-center">
        <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Validation Data</h3>
        <p className="text-sm text-slate-600">
          Upload and validate a drawing to see the summary report
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Validation Report Summary</h2>
            <p className="text-blue-100">Automated Drawing Analysis Results</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-sm text-blue-100 mb-1">File Name</div>
            <div className="font-semibold truncate">{file.name}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-sm text-blue-100 mb-1">Drawing Number</div>
            <div className="font-semibold">{data?.titleBlock?.drawingNumber || 'Not detected'}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-sm text-blue-100 mb-1">OCR Confidence</div>
            <div className="font-semibold">{data?.confidence ? Math.round(data.confidence) : 'N/A'}%</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-sm text-blue-100 mb-1">Validation Date</div>
            <div className="font-semibold">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Grade and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Grade */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 text-center">
          <Award className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <div className="text-sm text-slate-500 mb-2">Overall Grade</div>
          <div className={`text-6xl font-bold ${gradeInfo.color} mb-3`}>
            {gradeInfo.grade}
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {Math.min(overallScore, 100)}%
          </div>
          <p className="text-sm text-slate-600">
            {overallScore >= 85
              ? 'Drawing meets quality standards'
              : overallScore >= 70
              ? 'Drawing needs improvement'
              : 'Drawing requires attention'}
          </p>
        </div>

        {/* Issue Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Issue Breakdown
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Errors</div>
                  <div className="text-xs text-slate-500">Critical issues</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Warnings</div>
                  <div className="text-xs text-slate-500">Non-critical issues</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-600">{warningCount}</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Passed Checks</div>
                  <div className="text-xs text-slate-500">Compliant items</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{passedCount}</div>
            </div>
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Compliance Metrics
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Title Block</span>
                <span className={`font-semibold ${titleBlockScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {titleBlockScore}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${titleBlockScore >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${titleBlockScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Views Detected</span>
                <span className="font-semibold text-slate-700">
                  {data?.views?.length || 0}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${(data?.views?.length || 0) >= 3 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, ((data?.views?.length || 0) / 3) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Notes Found</span>
                <span className="font-semibold text-slate-700">
                  {data?.notes?.length || 0}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, ((data?.notes?.length || 0) / 5) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">GD&T Controls</span>
                <span className="font-semibold text-slate-700">
                  {data?.gdAndT?.featureControlFrames || 0}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, ((data?.gdAndT?.featureControlFrames || 0) / 3) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Findings */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-600" />
          Detailed Findings
        </h3>

        {/* Category summaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['title_block', 'spelling', 'asme_compliance', 'dimensions', 'gd&t', 'general'].map((category) => {
            const categoryResults = results.filter(r => r.category === category);
            const catErrors = categoryResults.filter(r => r.severity === 'error').length;
            const catWarnings = categoryResults.filter(r => r.severity === 'warning').length;

            return (
              <div key={category} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900 capitalize">
                    {category.replace('_', ' ')}
                  </span>
                  {catErrors + catWarnings === 0 && categoryResults.length > 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : catErrors + catWarnings > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  ) : (
                    <span className="text-xs text-slate-400">Not checked</span>
                  )}
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-red-600">{catErrors} errors</span>
                  <span className="text-amber-600">{catWarnings} warnings</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* All issues list */}
        {results.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-slate-900 mb-3">All Findings ({results.length})</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`text-sm p-3 rounded-lg ${
                    result.severity === 'error'
                      ? 'bg-red-50 border border-red-200'
                      : result.severity === 'warning'
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`font-bold uppercase ${
                      result.severity === 'error' ? 'text-red-600' :
                      result.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      [{result.severity}]
                    </span>
                    <div>
                      <span className="text-slate-500 text-xs">({result.standard})</span>
                      <p className="text-slate-900 font-medium">{result.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6" />
          Recommendations
        </h3>
        <div className="space-y-3">
          {errorCount > 0 && (
            <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                <span className="font-semibold">Critical:</span> Fix {errorCount} error{errorCount > 1 ? 's' : ''} found during validation before release.
              </p>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                <span className="font-semibold">Important:</span> Address {warningCount} warning{warningCount > 1 ? 's' : ''} to improve drawing quality and ASME compliance.
              </p>
            </div>
          )}
          {errorCount === 0 && warningCount === 0 && (
            <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                <span className="font-semibold">Good:</span> No major issues found. Drawing appears acceptable.
              </p>
            </div>
          )}
          <div className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
            <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold">Note:</span> OCR quality affects accuracy. For best results, ensure drawings are clear and high-resolution.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        Report generated on {new Date().toLocaleString()}
      </div>
    </div>
  );
}

export default ValidationSummary;
