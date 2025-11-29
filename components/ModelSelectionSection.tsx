import React, { useEffect } from 'react';
import { Cpu, ChevronDown, ChevronUp, Brain, FileText, Database, Sliders, Repeat, Play } from 'lucide-react';
import { ModelConfig, ModelCategory, Dataset } from '../types';

interface Props {
  dataset: Dataset | null;
  config: ModelConfig;
  onChange: (config: ModelConfig) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTrain: () => void;
  isTraining: boolean;
}

const TUNABLE_PARAMS: Record<string, { name: string; label: string; placeholder: string }[]> = {
  'Random Forest': [
    { name: 'n_estimators', label: 'Number of Trees', placeholder: 'e.g. 50, 100, 200' },
    { name: 'max_depth', label: 'Max Depth', placeholder: 'e.g. 10, 20, None' },
  ],
  'Gradient Boosting': [
    { name: 'learning_rate', label: 'Learning Rate', placeholder: 'e.g. 0.01, 0.1' },
    { name: 'n_estimators', label: 'N Estimators', placeholder: 'e.g. 100, 200' },
  ],
  'AdaBoost': [
    { name: 'n_estimators', label: 'N Estimators', placeholder: 'e.g. 50, 100' },
    { name: 'learning_rate', label: 'Learning Rate', placeholder: 'e.g. 1.0, 0.5' },
  ],
  'K-Nearest Neighbors': [
    { name: 'n_neighbors', label: 'N Neighbors (K)', placeholder: 'e.g. 3, 5, 7' },
    { name: 'weights', label: 'Weights', placeholder: 'uniform, distance' },
  ],
  'Logistic Regression': [
    { name: 'C', label: 'Regularization (C)', placeholder: 'e.g. 0.1, 1.0, 10.0' },
    { name: 'penalty', label: 'Penalty', placeholder: 'e.g. l1, l2' },
  ],
  'SVM': [
    { name: 'C', label: 'Regularization (C)', placeholder: 'e.g. 0.1, 1, 10' },
    { name: 'kernel', label: 'Kernel', placeholder: 'e.g. linear, rbf' },
  ],
  'XGBoost': [
    { name: 'learning_rate', label: 'Learning Rate', placeholder: 'e.g. 0.01, 0.1' },
    { name: 'n_estimators', label: 'N Estimators', placeholder: 'e.g. 100, 500' },
  ],
  'Decision Tree': [
    { name: 'max_depth', label: 'Max Depth', placeholder: 'e.g. 5, 10, 20' },
    { name: 'min_samples_split', label: 'Min Samples Split', placeholder: 'e.g. 2, 5, 10' },
  ],
  'Naive Bayes': [
    { name: 'var_smoothing', label: 'Var Smoothing', placeholder: 'e.g. 1e-9' },
  ],
  'Artificial Neural Network (ANN)': [
    { name: 'epochs', label: 'Epochs', placeholder: 'e.g. 50, 100' },
    { name: 'batch_size', label: 'Batch Size', placeholder: 'e.g. 32, 64' },
    { name: 'learning_rate', label: 'Learning Rate', placeholder: 'e.g. 0.001, 0.01' },
  ],
  'Convolutional Neural Network (CNN)': [
    { name: 'epochs', label: 'Epochs', placeholder: 'e.g. 10, 20' },
    { name: 'filters', label: 'Conv Filters', placeholder: 'e.g. 32, 64' },
  ],
  'Recurrent Neural Network (RNN)': [
    { name: 'units', label: 'RNN Units', placeholder: 'e.g. 50, 64' },
    { name: 'return_sequences', label: 'Return Sequences', placeholder: 'True/False' },
  ],
  'Simple Transformer': [
    { name: 'num_heads', label: 'Attention Heads', placeholder: 'e.g. 2, 4' },
    { name: 'ff_dim', label: 'Feed Forward Dim', placeholder: 'e.g. 32, 64' },
  ],
  'LSTM': [
    { name: 'units', label: 'LSTM Units', placeholder: 'e.g. 50, 100' },
    { name: 'epochs', label: 'Epochs', placeholder: 'e.g. 10, 20' },
  ],
  'TF-IDF Classifier': [
    { name: 'max_features', label: 'Max Features', placeholder: 'e.g. 1000, 5000' },
  ],
  'DistilBERT': [
    { name: 'learning_rate', label: 'Learning Rate', placeholder: 'e.g. 2e-5, 5e-5' },
    { name: 'epochs', label: 'Epochs', placeholder: 'e.g. 3, 5' },
  ],
  'BERT (Base)': [
    { name: 'learning_rate', label: 'Learning Rate', placeholder: 'e.g. 2e-5' },
  ],
  'RoBERTa': [
    { name: 'learning_rate', label: 'Learning Rate', placeholder: 'e.g. 1e-5' },
  ]
};

const ModelSelectionSection: React.FC<Props> = ({ 
  dataset, 
  config, 
  onChange, 
  isExpanded, 
  onToggleExpand,
  onTrain,
  isTraining
}) => {
  const handleChange = (key: keyof ModelConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleTuningChange = (key: string, value: any) => {
    onChange({
      ...config,
      tuning: { ...config.tuning, [key]: value }
    });
  };

  const handleCVChange = (key: string, value: any) => {
    onChange({
      ...config,
      crossValidation: { ...config.crossValidation, [key]: value }
    });
  };

  const handleParamGridChange = (param: string, value: string) => {
    onChange({
      ...config,
      tuning: {
        ...config.tuning,
        paramGrid: { ...config.tuning.paramGrid, [param]: value }
      }
    });
  };

  const categories = [
    { id: ModelCategory.ML, label: 'ML Models', icon: Database },
    { id: ModelCategory.DL, label: 'Deep Learning', icon: Brain },
    { id: ModelCategory.NLP, label: 'NLP Models', icon: FileText },
  ];

  const models: Record<ModelCategory, string[]> = {
    [ModelCategory.ML]: [
      'Logistic Regression', 'Random Forest', 'XGBoost', 'SVM', 'Decision Tree',
      'Gradient Boosting', 'AdaBoost', 'K-Nearest Neighbors', 'Naive Bayes'
    ],
    [ModelCategory.DL]: [
      'Artificial Neural Network (ANN)', 'Convolutional Neural Network (CNN)', 'LSTM', 
      'Recurrent Neural Network (RNN)', 'Simple Transformer'
    ],
    [ModelCategory.NLP]: [
      'TF-IDF Classifier', 'DistilBERT', 'BERT (Base)', 'RoBERTa'
    ],
  };

  useEffect(() => {
    onChange({
      ...config,
      tuning: { ...config.tuning, paramGrid: {} }
    });
  }, [config.modelName]);

  const currentParams = TUNABLE_PARAMS[config.modelName] || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all duration-300">
      <div 
        className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-t-xl"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Cpu size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Model Configuration</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Architecture & Training</p>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
           <ChevronDown className="text-slate-400" />
        </div>
      </div>

      {isExpanded && (
        <div className="p-8 border-t border-slate-200 dark:border-slate-800 space-y-8">
          
          {/* Top Row: Target & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Variable</label>
                <div className="relative">
                  <select 
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 focus:outline-none appearance-none disabled:opacity-50"
                    value={config.targetColumn}
                    onChange={(e) => handleChange('targetColumn', e.target.value)}
                    disabled={!dataset}
                  >
                    <option value="">Select Column...</option>
                    {dataset?.columns.map(col => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                </div>
             </div>

             <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Algorithm Type</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleChange('category', cat.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        config.category === cat.id 
                          ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <cat.icon size={16} />
                      {cat.label}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          {/* Model Dropdown */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Specific Model</label>
            <div className="relative">
              <select 
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 focus:outline-none appearance-none"
                value={config.modelName}
                onChange={(e) => handleChange('modelName', e.target.value)}
              >
                {models[config.category].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Configuration Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Cross Validation */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                   <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded text-blue-600 dark:text-blue-400">
                     <Repeat size={18} />
                   </div>
                   <h3 className="font-semibold text-slate-900 dark:text-white">Cross-Validation</h3>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                   <input 
                     type="checkbox" 
                     className="sr-only peer" 
                     checked={config.crossValidation?.enabled || false}
                     onChange={(e) => handleCVChange('enabled', e.target.checked)}
                   />
                   <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                 </label>
               </div>

               <div className={`transition-opacity duration-300 ${config.crossValidation?.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    K-Folds: <span className="text-blue-600 font-bold">{config.crossValidation.kFold}</span>
                  </label>
                  <input 
                    type="range" 
                    min="2" 
                    max="10" 
                    step="1" 
                    value={config.crossValidation.kFold}
                    onChange={(e) => handleCVChange('kFold', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>2 Folds</span>
                    <span>10 Folds</span>
                  </div>
               </div>
            </div>

            {/* Hyperparameter Tuning */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-colors">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                   <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded text-emerald-600 dark:text-emerald-400">
                     <Sliders size={18} />
                   </div>
                   <h3 className="font-semibold text-slate-900 dark:text-white">Hyperparameter Tuning</h3>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                   <input 
                     type="checkbox" 
                     className="sr-only peer" 
                     checked={config.tuning.enabled}
                     onChange={(e) => handleTuningChange('enabled', e.target.checked)}
                   />
                   <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                 </label>
               </div>

               <div className={`space-y-4 transition-opacity duration-300 ${config.tuning.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="tuningMethod"
                        value="grid"
                        checked={config.tuning.method === 'grid'}
                        onChange={() => handleTuningChange('method', 'grid')}
                        className="text-emerald-500 focus:ring-0 bg-white dark:bg-slate-700 border-slate-300"
                      />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">Grid Search</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="tuningMethod"
                        value="random"
                        checked={config.tuning.method === 'random'}
                        onChange={() => handleTuningChange('method', 'random')}
                        className="text-emerald-500 focus:ring-0 bg-white dark:bg-slate-700 border-slate-300"
                      />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">Random Search</span>
                    </label>
                  </div>

                  {currentParams.length > 0 ? (
                    <div className="space-y-3">
                      {currentParams.map(param => (
                        <div key={param.name}>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{param.label}</label>
                          <input 
                            type="text" 
                            placeholder={param.placeholder}
                            value={config.tuning.paramGrid[param.name] || ''}
                            onChange={(e) => handleParamGridChange(param.name, e.target.value)}
                            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none placeholder-slate-400"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic p-2 bg-slate-100 dark:bg-slate-800 rounded">No specific tunable parameters available for this model yet.</p>
                  )}
               </div>
            </div>

          </div>

          <div className="pt-6 flex justify-end">
            <button
              onClick={onTrain}
              disabled={!dataset || !config.targetColumn || isTraining}
              className={`
                px-8 py-4 rounded-xl font-bold text-white shadow-lg flex items-center gap-2
                ${!dataset || !config.targetColumn || isTraining
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-primary-500/25 transform active:scale-95 transition-all'}
              `}
            >
              {isTraining ? (
                <>Training in Progress...</>
              ) : (
                <>
                  <Play size={20} fill="currentColor" /> Start Training Simulation
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelectionSection;