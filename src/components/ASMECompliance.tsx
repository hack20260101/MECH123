import { Shield, CheckCircle2, AlertTriangle, AlertCircle, Ruler, Layers, CircleDot } from 'lucide-react';
import { DrawingData, ValidationResult } from '../types';

interface ASMEComplianceProps {
  data: DrawingData;
  results: ValidationResult[];
}

function ASMECompliance({ data, results }: ASMEComplianceProps) {
  const errors = results.filter(r => r.severity === 'error');
  const warnings = results.filter(r => r.severity === 'warning');
  const info = results.filter(r => r.severity === 'info');

  const errorCount = errors.length;
  const warningCount = warnings.length;

  // Calculate compliance score based on what was found
  const totalIssues = errorCount + warningCount;
  const baseScore = 100;
  const errorPenalty = errorCount * 15;
  const warningPenalty = warningCount * 5;
  const complianceScore = Math.max(0, baseScore - errorPenalty - warningPenalty);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-teal-500';
    if (score >= 70) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const viewsLength = data?.views?.length || 0;
  const gdtFCF = data?.gdAndT?.featureControlFrames || 0;
  const datums = data?.gdAndT?.datums || [];
  const linearDims = data?.dimensions?.linear?.length || 0;
  const angularDims = data?.dimensions?.angular?.length || 0;
  const geometricDims = data?.dimensions?.geometric?.length || 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">ASME Y14.5 Compliance</h3>
            <p className="text-xs text-slate-500">Dimensioning & GD&T Validation</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor(complianceScore)}`}>
            {complianceScore}%
          </div>
          <p className="text-xs text-slate-500">Compliance Score</p>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e2e8f0"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={complianceScore >= 85 ? '#10b981' : complianceScore >= 70 ? '#f59e0b' : '#ef4444'}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(complianceScore / 100) * 351.86} 351.86`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-3xl font-bold ${getScoreColor(complianceScore)}`}>
              {complianceScore}
            </span>
            <span className="text-xs text-slate-500">Score</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-xs text-slate-600">Errors</div>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="text-2xl font-bold text-amber-600">{warningCount}</div>
          <div className="text-xs text-slate-600">Warnings</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{info.length}</div>
          <div className="text-xs text-slate-600">Passed</div>
        </div>
      </div>

      {/* Drawing Elements */}
      <div className="space-y-4">
        {/* Views */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-900 text-sm">Views ({viewsLength})</span>
          </div>
          {viewsLength > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.views.map((view, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-slate-700 border border-slate-200"
                >
                  {view}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No views detected</p>
          )}
          {viewsLength > 0 && viewsLength < 3 && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Minimum 3 orthogonal views recommended
            </p>
          )}
        </div>

        {/* GD&T */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <CircleDot className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-900 text-sm">GD&T Analysis</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500">Feature Control Frames</p>
              <p className="text-xl font-bold text-slate-900">{gdtFCF}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500">Datums Defined</p>
              <p className="text-xl font-bold text-slate-900">{datums.length}</p>
            </div>
          </div>
          {datums.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {datums.map((datum, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium"
                >
                  Datum {datum}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dimensions */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-900 text-sm">Dimensions</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
              <div className="text-lg font-bold text-teal-600">{linearDims}</div>
              <div className="text-xs text-slate-500">Linear</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
              <div className="text-lg font-bold text-teal-600">{angularDims}</div>
              <div className="text-xs text-slate-500">Angular</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
              <div className="text-lg font-bold text-teal-600">{geometricDims}</div>
              <div className="text-xs text-slate-500">GD&T</div>
            </div>
          </div>
          {linearDims === 0 && angularDims === 0 && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              No dimensions detected
            </p>
          )}
        </div>
      </div>

      {/* Validation Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-3 pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900">Findings:</h4>
          {results.slice(0, 5).map((result) => (
            <div
              key={result.id}
              className={`p-3 rounded-lg border ${
                result.severity === 'error'
                  ? 'bg-red-50 border-red-200'
                  : result.severity === 'warning'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {result.severity === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                ) : result.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-slate-900 font-medium">{result.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{result.standard}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ASMECompliance;
