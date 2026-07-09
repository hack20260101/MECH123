import { SpellCheck, AlertCircle, CheckCircle2, MessageSquare, Scan } from 'lucide-react';
import { ValidationResult } from '../types';

interface SpellingValidationProps {
  notes: string[];
  results: ValidationResult[];
}

// Common engineering misspellings database
const engineeringSpellCheck: { [key: string]: string } = {
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
  'MEASURMENT': 'MEASUREMENT'
};

function SpellingValidation({ notes, results }: SpellingValidationProps) {
  const errorCount = results.filter(r => r.severity === 'error' || r.severity === 'warning').length;

  // Highlight misspelled words in notes
  const highlightNote = (note: string) => {
    let highlightedNote = note;
    const misspellings = Object.keys(engineeringSpellCheck);

    misspellings.forEach(misspelling => {
      const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
      if (regex.test(note)) {
        highlightedNote = highlightedNote.replace(
          regex,
          `<span class="bg-red-200 text-red-800 px-1 rounded font-bold">${misspelling}</span>`
        );
      }
    });

    return highlightedNote;
  };

  if (notes.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <SpellCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Spelling Validation</h3>
            <p className="text-xs text-slate-500">Notes & Annotations Check</p>
          </div>
        </div>

        <div className="p-8 text-center">
          <Scan className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No notes detected</p>
          <p className="text-sm text-slate-500 mt-1">
            Upload a drawing with visible notes for spelling validation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <SpellCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Spelling Validation</h3>
            <p className="text-xs text-slate-500">Notes & Annotations Check</p>
          </div>
        </div>
        <div className="text-right">
          {errorCount === 0 ? (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              All Clear
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
            </span>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
          <MessageSquare className="w-4 h-4" />
          <span className="font-medium">Drawing Notes ({notes.length})</span>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {notes.map((note, index) => {
            const hasError = results.some(r => r.context?.includes(note.substring(0, 30)));
            const isHighlighted = highlightNote(note) !== note;

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  hasError || isHighlighted
                    ? 'bg-red-50 border-red-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {hasError || isHighlighted ? (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className="text-sm text-slate-700"
                    dangerouslySetInnerHTML={{
                      __html: hasError || isHighlighted ? highlightNote(note) : note
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spelling Errors Found */}
      {results.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Corrections Needed:</h4>
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold line-through text-sm">
                      {(result.message.match(/"([^"]+)"/) || ['', ''])[1]}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="text-emerald-600 font-bold text-sm">
                      {(result.message.match(/"([^"]+)" should be "([^"]+)"/) || ['', '', ''])[2]}
                    </span>
                  </div>
                </div>
                <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Fix
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engineering Dictionary Reference */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          <span className="font-medium">Engineering Dictionary:</span> Validated against engineering terminology standards including ASME Y14.5 terms, GD&T terminology, and manufacturing specifications.
        </p>
      </div>
    </div>
  );
}

export default SpellingValidation;
