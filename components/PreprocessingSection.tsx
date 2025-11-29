import React from 'react';
import { Settings, ChevronDown, Filter, ScanLine, Layers, ArrowRight, Zap } from 'lucide-react';
import { PreprocessingConfig } from '../types';

interface Props {
  config: PreprocessingConfig;
  onChange: (config: PreprocessingConfig) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const PreprocessingSection: React.FC<Props> = ({ config, onChange, isExpanded, onToggleExpand }) => {
  const handleChange = (key: keyof PreprocessingConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleTextProcessChange = (key: keyof PreprocessingConfig['textProcessing']) => {
    onChange({
      ...config,
      textProcessing: {
        ...config.textProcessing,
        [key]: !config.textProcessing[key]
      }
    });
  };

  const handleTextVectorChange = (value: string) => {
     onChange({
      ...config,
      textProcessing: {
        ...config.textProcessing,
        vectorization: value as any
      }
    });
  }

  const SelectInput = ({ label, value, options, onChange }: any) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="relative">
        <select 
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 focus:outline-none appearance-none transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
      </div>
    </div>
  );

  // Visualization of the pipeline
  const getPipelineSteps = () => {
      const steps = [
          { name: 'Data Load', active: true },
          { name: 'Clean', active: config.missingValueStrategy !== 'drop' || config.droppedColumns.length > 0 },
          { name: 'Feature Eng.', active: config.featureEngineering !== 'none' || config.classBalancing !== 'none' },
          { name: 'Scale', active: config.scaling !== 'none' },
          { name: 'Encode', active: config.encoding !== 'label' }, // Assuming label is default/minimal
          { name: 'Train', active: true }
      ];
      return steps;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all duration-300">
      <div 
        className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-t-xl"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-xl text-purple-600 dark:text-purple-400">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Preprocessing</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Cleaning, Scaling & Engineering</p>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
           <ChevronDown className="text-slate-400" />
        </div>
      </div>

      {isExpanded && (
        <div className="p-8 border-t border-slate-200 dark:border-slate-800 space-y-8">
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SelectInput 
              label="Imputation Strategy"
              value={config.missingValueStrategy}
              onChange={(v: string) => handleChange('missingValueStrategy', v)}
              options={[
                { value: 'drop', label: 'Drop Rows' },
                { value: 'mean', label: 'Mean Substitution' },
                { value: 'median', label: 'Median Substitution' },
                { value: 'mode', label: 'Most Frequent' },
                { value: 'knn', label: 'KNN Imputation' }
              ]}
            />
             <SelectInput 
              label="Feature Scaling"
              value={config.scaling}
              onChange={(v: string) => handleChange('scaling', v)}
              options={[
                { value: 'none', label: 'None' },
                { value: 'standard', label: 'StandardScaler (Z-score)' },
                { value: 'minmax', label: 'MinMaxScaler (0-1)' },
                { value: 'robust', label: 'RobustScaler (IQR)' }
              ]}
            />
             <SelectInput 
              label="Categorical Encoding"
              value={config.encoding}
              onChange={(v: string) => handleChange('encoding', v)}
              options={[
                { value: 'label', label: 'Label Encoding' },
                { value: 'onehot', label: 'One-Hot Encoding' }
              ]}
            />
          </div>

          {/* Advanced Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter size={14} /> Advanced Techniques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SelectInput 
                    label="Outlier Handling"
                    value={config.outlierRemoval}
                    onChange={(v: string) => handleChange('outlierRemoval', v)}
                    options={[
                        { value: 'none', label: 'Keep Outliers' },
                        { value: 'zscore', label: 'Remove Z-Score > 3' },
                        { value: 'iqr', label: 'Remove IQR Based (1.5x)' }
                    ]}
                />
                <SelectInput 
                    label="Dimensionality Reduction"
                    value={config.dimensionalityReduction}
                    onChange={(v: string) => handleChange('dimensionalityReduction', v)}
                    options={[
                        { value: 'none', label: 'None' },
                        { value: 'pca', label: 'PCA (Principal Component)' }
                    ]}
                />
                <SelectInput 
                    label="Class Balancing"
                    value={config.classBalancing || 'none'}
                    onChange={(v: string) => handleChange('classBalancing', v)}
                    options={[
                        { value: 'none', label: 'None' },
                        { value: 'oversampling', label: 'Random Oversampling' },
                        { value: 'undersampling', label: 'Random Undersampling' },
                        { value: 'smote', label: 'SMOTE (Synthetic)' }
                    ]}
                />
                <SelectInput 
                    label="Feature Engineering"
                    value={config.featureEngineering || 'none'}
                    onChange={(v: string) => handleChange('featureEngineering', v)}
                    options={[
                        { value: 'none', label: 'None' },
                        { value: 'polynomial', label: 'Polynomial Features (Deg 2)' },
                        { value: 'interaction', label: 'Interaction Only' }
                    ]}
                />
            </div>
          </div>

          {/* NLP Section */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
             <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                <ScanLine size={16} className="text-slate-500" /> NLP Specific
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 <div className="flex flex-col gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={config.textProcessing.removeStopwords}
                            onChange={() => handleTextProcessChange('removeStopwords')}
                            className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Remove Stopwords</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={config.textProcessing.lemmatization}
                            onChange={() => handleTextProcessChange('lemmatization')}
                            className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Apply Lemmatization</span>
                    </label>
                 </div>
                 <SelectInput 
                    label="Vectorization Method"
                    value={config.textProcessing.vectorization}
                    onChange={handleTextVectorChange}
                    options={[
                        { value: 'tfidf', label: 'TF-IDF' },
                        { value: 'count', label: 'Count Vectorizer' },
                        { value: 'word2vec', label: 'Word2Vec Embeddings' }
                    ]}
                />
             </div>
          </div>

          {/* Pipeline Visualizer & Split */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
                {/* Pipeline Flow */}
                <div className="lg:col-span-2">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <Layers size={16} className="text-slate-500" /> Pipeline Preview
                    </h3>
                    <div className="flex items-center gap-2 overflow-x-auto pb-4">
                        {getPipelineSteps().map((step, idx, arr) => (
                            <div key={idx} className={`flex items-center gap-2 flex-shrink-0 ${!step.active ? 'opacity-40 grayscale' : ''}`}>
                                <div className={`
                                    px-3 py-1.5 rounded-lg text-xs font-bold border
                                    ${step.active 
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}
                                `}>
                                    {step.name}
                                </div>
                                {idx < arr.length - 1 && (
                                    <ArrowRight size={14} className="text-slate-300 dark:text-slate-600" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Split Ratio */}
                <div>
                     <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Train/Test Split</label>
                        <span className="text-sm font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded">
                            {Math.round(config.splitRatio * 100)}% Train / {Math.round((1 - config.splitRatio) * 100)}% Test
                        </span>
                        </div>
                        <input 
                        type="range" 
                        min="0.5" 
                        max="0.9" 
                        step="0.05" 
                        value={config.splitRatio}
                        onChange={(e) => handleChange('splitRatio', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                </div>
             </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default PreprocessingSection;