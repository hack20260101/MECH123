import { useCallback, useState } from 'react';
import { Upload, FileCheck, FileWarning } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

function FileUpload({ onFileUpload, isProcessing }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleValidate = useCallback(() => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  }, [selectedFile, onFileUpload]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const supportedFormats = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.dxf', '.dwg'];

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative bg-white rounded-3xl border-2 border-dashed p-16
          transition-all duration-300 ease-in-out
          ${isDragOver
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
          ${isProcessing ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept={supportedFormats.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="text-center">
          <div className={`
            w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6
            transition-all duration-300
            ${isDragOver
              ? 'bg-blue-600 scale-110'
              : 'bg-gradient-to-br from-blue-100 to-cyan-100'}
          `}>
            <Upload className={`
              w-10 h-10 transition-colors
              ${isDragOver ? 'text-white' : 'text-blue-600'}
            `} />
          </div>

          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {isDragOver ? 'Drop your drawing here' : 'Upload Engineering Drawing'}
          </h3>
          <p className="text-slate-600 mb-4">
            Drag & drop or click to browse
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {supportedFormats.map((format) => (
              <span
                key={format}
                className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium"
              >
                {format.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Selected File Preview */}
      {selectedFile && !isProcessing && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <FileCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{selectedFile.name}</h4>
                <p className="text-sm text-slate-600">
                  {formatFileSize(selectedFile.size)} • Ready for validation
                </p>
              </div>
            </div>
            <button
              onClick={handleValidate}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <FileWarning className="w-5 h-5" />
              Validate Drawing
            </button>
          </div>
        </div>
      )}

      {/* Use Case Info */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
        <h3 className="text-xl font-bold mb-4">What This Framework Validates:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-semibold">Title Block Completeness</h4>
              <p className="text-sm text-blue-100">Drawing number, scale, material, units, revision</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-semibold">Spelling & Notes</h4>
              <p className="text-sm text-blue-100">Engineering terms, specifications, annotations</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-semibold">ASME Y14.5 Compliance</h4>
              <p className="text-sm text-blue-100">GD&T symbols, datums, feature control frames</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-semibold">Dimension Validation</h4>
              <p className="text-sm text-blue-100">Tolerances, units, missing dimensions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
