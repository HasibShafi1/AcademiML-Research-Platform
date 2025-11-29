import React, { useState } from 'react';
import { Upload, Trash2, ChevronDown, ChevronUp, Database, FileSpreadsheet } from 'lucide-react';
import { Dataset } from '../types';
import { parseCSV, getSampleDataset } from '../services/utils';

interface Props {
  onDatasetUpload: (dataset: Dataset) => void;
  dataset: Dataset | null;
  droppedColumns: string[];
  onToggleDropColumn: (colName: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const UploadSection: React.FC<Props> = ({ 
  onDatasetUpload, 
  dataset, 
  droppedColumns, 
  onToggleDropColumn,
  isExpanded,
  onToggleExpand
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError("Please upload a valid CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseCSV(content, file.name);
        onDatasetUpload(parsed);
        setError(null);
      } catch (err) {
        setError("Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const loadSample = (type: 'titanic' | 'iris' | 'housing' | 'wine') => {
    try {
      const data = getSampleDataset(type);
      onDatasetUpload(data);
      setError(null);
    } catch (err) {
      setError("Failed to load sample dataset.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all duration-300">
      <div 
        className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-t-xl"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4">
          <div className="bg-primary-100 dark:bg-primary-900/30 p-2.5 rounded-xl text-primary-600 dark:text-primary-400">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Dataset</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {dataset ? `Active: ${dataset.name}` : 'Upload or Select Sample Data'}
            </p>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
           <ChevronDown className="text-slate-400" />
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
          {!dataset && (
            <div className="space-y-8">
              {/* Dropzone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all cursor-pointer relative group">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={32} className="text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Upload your Dataset</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Support for .csv files (Max 50MB)</p>
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="bg-white dark:bg-slate-900 px-4 text-slate-500">Or use a sample</span>
                </div>
              </div>

              {/* Sample Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { id: 'titanic', label: 'Titanic', desc: 'Survival Classification' },
                  { id: 'iris', label: 'Iris Flowers', desc: 'Species Clustering' },
                  { id: 'housing', label: 'Housing', desc: 'Price Regression' },
                  { id: 'wine', label: 'Wine Quality', desc: 'Quality Scoring' },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => loadSample(item.id as any)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileSpreadsheet size={16} className="text-primary-500" />
                      <h3 className="font-semibold text-slate-900 dark:text-white">{item.label}</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {dataset && (
            <div className="space-y-6">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Rows', val: dataset.totalRows },
                  { label: 'Columns', val: dataset.columns.length },
                  { label: 'Missing Values', val: dataset.columns.reduce((acc, col) => acc + col.missingCount, 0) },
                ].map((stat, idx) => (
                   <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                     <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">{stat.label}</span>
                     <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.val}</p>
                   </div>
                ))}
                 <button 
                  onClick={() => onDatasetUpload({ ...dataset, name: '' } as any)} 
                  className="bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 p-4 rounded-xl transition-all flex flex-col justify-center items-center font-medium text-sm"
                >
                   Reset Dataset
                </button>
              </div>

              {/* Data Table */}
              <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 sticky top-0 z-10 shadow-sm">
                      <tr>
                        {dataset.columns.map(col => (
                          <th key={col.name} className="px-6 py-4 whitespace-nowrap bg-slate-100 dark:bg-slate-800">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex flex-col">
                                <span className={droppedColumns.includes(col.name) ? "line-through opacity-50" : ""}>{col.name}</span>
                                <span className="text-[10px] text-primary-600 dark:text-primary-400 normal-case bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded w-fit mt-0.5">{col.type}</span>
                              </div>
                              <button 
                                onClick={() => onToggleDropColumn(col.name)}
                                className={`p-1.5 rounded-md transition-colors ${droppedColumns.includes(col.name) ? 'text-red-600 bg-red-100 dark:bg-red-900/30' : 'text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                title="Toggle Drop"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {dataset.rows.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          {dataset.columns.map(col => (
                            <td key={col.name} className={`px-6 py-3 whitespace-nowrap ${droppedColumns.includes(col.name) ? 'opacity-30 line-through bg-slate-50/50 dark:bg-slate-900/50' : ''}`}>
                              {row[col.name]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-center text-slate-500">Previewing first 10 rows</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadSection;