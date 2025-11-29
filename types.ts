
export interface DatasetColumn {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'unknown';
  missingCount: number;
  uniqueCount: number;
}

export interface Dataset {
  name: string;
  rows: any[];
  columns: DatasetColumn[];
  totalRows: number;
}

export enum ModelCategory {
  ML = 'Machine Learning',
  DL = 'Deep Learning',
  NLP = 'NLP',
}

export interface PreprocessingConfig {
  missingValueStrategy: 'drop' | 'mean' | 'median' | 'mode' | 'knn';
  scaling: 'none' | 'standard' | 'minmax' | 'robust';
  encoding: 'label' | 'onehot';
  splitRatio: number;
  outlierRemoval: 'none' | 'zscore' | 'iqr';
  dimensionalityReduction: 'none' | 'pca';
  classBalancing: 'none' | 'oversampling' | 'undersampling' | 'smote';
  featureEngineering: 'none' | 'polynomial' | 'interaction';
  textProcessing: {
    removeStopwords: boolean;
    lemmatization: boolean;
    stemming: boolean;
    vectorization: 'tfidf' | 'count' | 'word2vec';
  };
  droppedColumns: string[];
}

export interface TuningConfig {
  enabled: boolean;
  method: 'grid' | 'random';
  paramGrid: Record<string, string>;
}

export interface CrossValidationConfig {
  enabled: boolean;
  kFold: number;
}

export interface ModelConfig {
  category: ModelCategory;
  modelName: string;
  targetColumn: string;
  hyperparameters: Record<string, string | number>;
  tuning: TuningConfig;
  crossValidation: CrossValidationConfig;
}

export interface TrainingMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc?: number;
  rmse?: number;
  mae?: number;
}

// --- Visualization Data Types ---

export interface Point { x: number; y: number; z?: number; label?: string; }
export interface HistogramBin { range: string; count: number; }
export interface FeatureImp { feature: string; importance: number; }
export interface EpochLog { epoch: number; loss: number; accuracy: number; val_loss: number; val_accuracy: number; }
export interface RadarMetric { metric: string; value: number; fullMark: number; }

export interface ColumnStats {
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  missing: number;
  unique: number;
  type: string;
}

export interface TrainingResult {
  metrics: TrainingMetrics;
  confusionMatrix: number[][]; 
  featureImportance: FeatureImp[];
  lossHistory: EpochLog[];
  // ML Viz Data
  rocCurve: Point[];
  precisionRecallCurve: Point[];
  residuals: Point[]; // x=predicted, y=residual
  learningCurve: Point[]; // x=training_size, y=score
  radarData: RadarMetric[];
  // DL Viz Data
  layerActivations: number[]; // Simplified for viz
  // Preprocessing Viz Data
  pcaComponents: Point[]; // 2D projection
  tsneComponents: Point[]; // t-SNE projection
  umapComponents: Point[]; // UMAP projection
  // Explainability
  shapValues: { feature: string; value: number }[];
  limeValues: { feature: string; value: number }[]; // Local interpretation
  // NLP
  wordCloud: { text: string; value: number }[];
  
  explanation: string; // Dynamic explanation text
  modelCategory: ModelCategory; // To filter viz
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  TRAINING = 'TRAINING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export type VizCategory = 'univariate' | 'bivariate' | 'preprocessing' | 'ml' | 'dl' | 'nlp' | 'explainability';
