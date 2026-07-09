import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { ValidationResult } from '../types';

interface ValidationResultsProps {
  results: ValidationResult[];
  title?: string;
}

function ValidationResults({ results, title = 'General Validation Results' }: ValidationResultsProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'info':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'warning':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'info':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-emerald-700 font-medium">All validations passed!</p>
          <p className="text-sm text-slate-500 mt-1">No issues found in this category</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
          {results.length} {results.length === 1 ? 'issue' : 'issues'}
        </span>
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={result.id}
            className={`rounded-xl p-4 border ${getSeverityStyles(result.severity)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getSeverityIcon(result.severity)}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getSeverityBadge(result.severity)}`}>
                    {result.severity}
                  </span>
                  <span className="text-xs text-slate-500">{result.id}</span>
                </div>
                <p className="text-slate-900 font-medium mb-1">{result.message}</p>

                {result.context && (
                  <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200">
                    <p className="text-xs text-slate-600 font-mono">"{result.context}"</p>
                  </div>
                )}

                <div className="mt-3 flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium">{result.standard}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      <span className="font-medium">Suggestion:</span> {result.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ValidationResults;
