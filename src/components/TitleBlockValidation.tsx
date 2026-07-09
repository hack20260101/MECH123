import { FileText, CheckCircle2, XCircle, AlertTriangle, Scan } from 'lucide-react';
import { TitleBlock } from '../types';

interface TitleBlockValidationProps {
  titleBlock: TitleBlock;
}

const requiredFields = [
  { key: 'drawingNumber', label: 'Drawing Number', critical: true },
  { key: 'title', label: 'Drawing Title', critical: true },
  { key: 'scale', label: 'Scale', critical: true },
  { key: 'date', label: 'Date', critical: true },
  { key: 'units', label: 'Units', critical: true },
  { key: 'revision', label: 'Revision', critical: false },
  { key: 'material', label: 'Material', critical: false },
  { key: 'finish', label: 'Finish/Surface Treatment', critical: false },
  { key: 'drawnBy', label: 'Drawn By', critical: false },
  { key: 'checkedBy', label: 'Checked By', critical: false },
  { key: 'approvedBy', label: 'Approved By', critical: false },
  { key: 'sheet', label: 'Sheet Number', critical: false }
];

function TitleBlockValidation({ titleBlock }: TitleBlockValidationProps) {
  const presentFields = requiredFields.filter(f => titleBlock[f.key]);
  const missingFields = requiredFields.filter(f => !titleBlock[f.key]);
  const missingCriticalFields = missingFields.filter(f => f.critical);
  const missingOptionalFields = missingFields.filter(f => !f.critical);

  const completionPercentage = Math.round((presentFields.length / requiredFields.length) * 100);

  if (presentFields.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Title Block Validation</h3>
            <p className="text-xs text-slate-500">ASME Y14.1 Compliance</p>
          </div>
        </div>

        <div className="p-8 text-center">
          <Scan className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No title block fields detected</p>
          <p className="text-sm text-slate-500 mt-1">
            Upload a drawing with a visible title block for validation
          </p>
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200 text-left">
            <p className="text-xs text-amber-700 font-medium mb-2">Expected fields:</p>
            <div className="flex flex-wrap gap-1">
              {requiredFields.map((f) => (
                <span key={f.key} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                  {f.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Title Block Validation</h3>
            <p className="text-xs text-slate-500">ASME Y14.1 Compliance</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            completionPercentage >= 80 ? 'text-emerald-600' :
            completionPercentage >= 50 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {completionPercentage}%
          </div>
          <p className="text-xs text-slate-500">{presentFields.length}/{requiredFields.length} fields</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completionPercentage >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
              completionPercentage >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-rose-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Critical Missing Fields */}
      {missingCriticalFields.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-700 text-sm">Missing Critical Fields</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingCriticalFields.map(field => (
              <span
                key={field.key}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
              >
                {field.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Optional Missing Fields */}
      {missingOptionalFields.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-amber-700 text-sm">Recommended Fields</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingOptionalFields.map(field => (
              <span
                key={field.key}
                className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium"
              >
                {field.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Present Fields Grid */}
      <div className="grid grid-cols-2 gap-3">
        {presentFields.map((field) => {
          const value = titleBlock[field.key];
          return (
            <div
              key={field.key}
              className="p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-slate-500 font-medium">{field.label}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 truncate">{value}</p>
            </div>
          );
        })}
      </div>

      {/* Present Fields Summary */}
      {missingFields.length === 0 && (
        <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-emerald-700">
              Title block is complete per ASME Y14.1 requirements
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TitleBlockValidation;
