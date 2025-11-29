import React, { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import PreprocessingSection from './components/PreprocessingSection';
import ModelSelectionSection from './components/ModelSelectionSection';
import TrainingSection from './components/TrainingSection';
import ResultsSection from './components/ResultsSection';
import DataAnalysisSection from './components/DataAnalysisSection';
import { Dataset, PreprocessingConfig, ModelConfig, ModelCategory, AppStatus, TrainingResult } from './types';
import { simulateBackendTraining } from './services/simulationService';
import { Layers, Moon, Sun, Github, Layout } from 'lucide-react';

function App() {
  // State
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Initial configs
  const [preprocessingConfig, setPreprocessingConfig] = useState<PreprocessingConfig>({
    missingValueStrategy: 'mean',
    scaling: 'standard',
    encoding: 'label',
    splitRatio: 0.8,
    outlierRemoval: 'none',
    dimensionalityReduction: 'none',
    classBalancing: 'none',
    featureEngineering: 'none',
    textProcessing: {
      removeStopwords: true,
      lemmatization: false,
      stemming: false,
      vectorization: 'tfidf'
    },
    droppedColumns: []
  });
  
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    category: ModelCategory.ML,
    modelName: 'Random Forest',
    targetColumn: '',
    hyperparameters: {},
    tuning: {
      enabled: false,
      method: 'grid',
      paramGrid: {}
    },
    crossValidation: {
      enabled: false,
      kFold: 5
    }
  });

  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [results, setResults] = useState<TrainingResult | null>(null);

  // Section Expansion State - Controls accordion behavior
  const [activeSection, setActiveSection] = useState<number>(1);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleSection = (sectionId: number) => {
    setActiveSection(prev => prev === sectionId ? 0 : sectionId);
  };

  const handleDatasetUpload = async (newDataset: Dataset) => {
    if (newDataset.name === '') {
        setDataset(null);
        setActiveSection(1);
        setStatus(AppStatus.IDLE);
        setResults(null);
        return;
    }

    setDataset(newDataset);
    setActiveSection(2); 
    
    // Auto-select target column if possible
    if (newDataset.columns.length > 0) {
        setModelConfig(prev => ({
            ...prev,
            targetColumn: newDataset.columns[newDataset.columns.length - 1].name
        }));
    }
  };

  const handleDropColumn = (colName: string) => {
    setPreprocessingConfig(prev => {
      const isDropped = prev.droppedColumns.includes(colName);
      return {
        ...prev,
        droppedColumns: isDropped 
          ? prev.droppedColumns.filter(c => c !== colName)
          : [...prev.droppedColumns, colName]
      };
    });
  };

  const handleTrain = async () => {
    if (!dataset) return;
    setStatus(AppStatus.TRAINING);
    setActiveSection(5); 
    
    // Call the Simulation Service
    const result = await simulateBackendTraining(dataset, modelConfig, preprocessingConfig);
    
    setResults(result);
    setStatus(AppStatus.COMPLETED);
    setActiveSection(6); 
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-primary-600 p-2 rounded-lg text-white shadow-lg shadow-primary-500/30">
                    <Layers size={22} />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-400 dark:to-indigo-300">
                      AcademiML
                  </h1>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
                    Research Platform
                  </span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <a href="#" className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Layout size={16} /> Dashboard
                </a>
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-full transition-all bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Toggle Theme"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        
        <UploadSection 
          dataset={dataset} 
          onDatasetUpload={handleDatasetUpload}
          droppedColumns={preprocessingConfig.droppedColumns}
          onToggleDropColumn={handleDropColumn}
          isExpanded={activeSection === 1}
          onToggleExpand={() => toggleSection(1)}
        />

        <DataAnalysisSection 
          dataset={dataset}
          isExpanded={activeSection === 2}
          onToggleExpand={() => toggleSection(2)}
        />

        <PreprocessingSection 
          config={preprocessingConfig}
          onChange={setPreprocessingConfig}
          isExpanded={activeSection === 3}
          onToggleExpand={() => toggleSection(3)}
        />

        <ModelSelectionSection 
          dataset={dataset}
          config={modelConfig}
          onChange={setModelConfig}
          isExpanded={activeSection === 4}
          onToggleExpand={() => toggleSection(4)}
          onTrain={handleTrain}
          isTraining={status === AppStatus.TRAINING}
        />

        <TrainingSection status={status} />

        {status === AppStatus.COMPLETED && (
            <ResultsSection result={results} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>© 2024 AcademiML Research Platform. Local Environment.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;