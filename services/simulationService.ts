import { Dataset, ModelConfig, PreprocessingConfig, TrainingResult, ModelCategory } from '../types';
import { calculateFeatureImpacts } from './utils';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate random normal distribution
const randn_bm = () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); 
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

export const simulateBackendTraining = async (
  dataset: Dataset,
  modelConfig: ModelConfig,
  preprocessing: PreprocessingConfig
): Promise<TrainingResult> => {
  // Simulate network latency (2 seconds)
  await wait(2000);

  const isClassification = [
    'Logistic Regression', 'Random Forest', 'XGBoost', 'SVM', 'Decision Tree', 
    'Gradient Boosting', 'AdaBoost', 'K-Nearest Neighbors', 'Naive Bayes',
    'CNN', 'ANN', 'RNN', 'Simple Transformer',
    'TF-IDF Classifier', 'DistilBERT', 'BERT (Base)', 'RoBERTa'
  ].includes(modelConfig.modelName);

  const isDL = modelConfig.category === ModelCategory.DL;

  // --- 1. Generate Consistent Confusion Matrix & Metrics ---
  
  // Base accuracy varies by model type (simulation)
  let baseAccuracy = 0.82;
  if(modelConfig.category === ModelCategory.DL) baseAccuracy = 0.88;
  if(modelConfig.tuning.enabled) baseAccuracy += 0.05;
  
  // Calculate real impacts from data
  const realImpacts = calculateFeatureImpacts(dataset, modelConfig.targetColumn);
  // Use strongest correlation to adjust accuracy (if data is noisy, accuracy drops)
  const maxCorrelation = realImpacts.length > 0 ? Math.abs(realImpacts[0].impact) : 0.5;
  const accuracyModifier = (maxCorrelation - 0.5) * 0.2; // Adjust base accuracy by +/- 10% based on data quality

  // Add some randomness but anchored to data quality
  const actualAccuracy = Math.min(0.99, Math.max(0.6, baseAccuracy + accuracyModifier + (Math.random() * 0.05)));
  
  const totalSamples = 200; // Simulated test set size
  const totalCorrect = Math.round(totalSamples * actualAccuracy);
  const totalWrong = totalSamples - totalCorrect;

  // Distribute Correct into TP and TN
  const tp = Math.round(totalCorrect * (0.5 + Math.random() * 0.1)); // Slightly unbalanced
  const tn = totalCorrect - tp;

  // Distribute Wrong into FP and FN
  const fp = Math.round(totalWrong * (0.4 + Math.random() * 0.2));
  const fn = totalWrong - fp;

  const confusionMatrix = [[tp, fp], [fn, tn]];

  // Derived Metrics (Mathematically Consistent)
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1Score = (2 * precision * recall) / (precision + recall) || 0;
  const accuracy = (tp + tn) / totalSamples;

  const metrics = {
    accuracy: parseFloat(accuracy.toFixed(4)),
    precision: parseFloat(precision.toFixed(4)),
    recall: parseFloat(recall.toFixed(4)),
    f1Score: parseFloat(f1Score.toFixed(4)),
    auc: isClassification ? parseFloat((accuracy + 0.02).toFixed(4)) : undefined,
    rmse: !isClassification ? parseFloat((Math.random() * 1000).toFixed(2)) : undefined,
    mae: !isClassification ? parseFloat((Math.random() * 800).toFixed(2)) : undefined,
  };

  // --- 2. ROC & PR Curves (Consistent with Accuracy) ---
  const rocCurve = [];
  const prCurve = [];
  // Better accuracy = steeper curve
  const steepness = 4 + (metrics.accuracy * 4); 
  
  for (let i = 0; i <= 20; i++) {
    const x = i / 20;
    
    // Logarithmic ROC approximation
    const tpr = x === 0 ? 0 : Math.min(1, Math.pow(x, 1/steepness)); 
    rocCurve.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(tpr.toFixed(2)) });

    // PR Curve approximation
    const p = Math.max(0, 1 - Math.pow(x, steepness)); 
    prCurve.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(p.toFixed(2)) });
  }

  // --- 3. Loss History (DL Only) ---
  const epochs = isDL ? 30 : 20;
  const lossHistory = [];
  let currLoss = 0.7;
  let currAcc = 0.5;
  for (let i = 1; i <= epochs; i++) {
    const decay = 0.9;
    currLoss = Math.max(0.1, currLoss * decay + (Math.random() * 0.02));
    currAcc = Math.min(metrics.accuracy + 0.02, currAcc + ((metrics.accuracy - currAcc) * 0.2));
    
    lossHistory.push({
      epoch: i,
      loss: parseFloat(currLoss.toFixed(4)),
      accuracy: parseFloat(currAcc.toFixed(4)),
      val_loss: parseFloat((currLoss + 0.05).toFixed(4)),
      val_accuracy: parseFloat((currAcc - 0.03).toFixed(4)),
    });
  }

  // --- 4. Projections (PCA, t-SNE, UMAP) ---
  const generateProjection = (separation: number, spread: number) => {
    const points = [];
    for (let i = 0; i < 150; i++) {
        // Cluster 0
        if (i < 75) {
            points.push({ 
                x: (randn_bm() * spread) - separation, 
                y: (randn_bm() * spread) + (Math.random() * 2), 
                label: 'Class 0' 
            });
        } else {
            // Cluster 1
            points.push({ 
                x: (randn_bm() * spread) + separation, 
                y: (randn_bm() * spread) - (Math.random() * 2), 
                label: 'Class 1' 
            });
        }
    }
    return points;
  };

  const pcaComponents = generateProjection(2 * accuracy, 1.5); // Better accuracy = better separation
  const tsneComponents = generateProjection(4 * accuracy, 0.8); 
  const umapComponents = generateProjection(5 * accuracy, 0.5); 

  // --- 5. Explainability (SHAP & LIME) - DATA AWARE ---
  
  // We use the realImpacts calculated at the start
  // Top 8 features
  const topFeatures = realImpacts.slice(0, 8);

  // SHAP (Global Importance) - Directly map correlation magnitude
  const shapValues = topFeatures.map(item => ({
      feature: item.name,
      value: Math.abs(item.impact) * (0.8 + Math.random() * 0.2) // Slight variance for "model vs data" diff
  }));

  // LIME (Local Explanation) - Consistent with Global
  // We simulate an instance that was predicted POSITIVE.
  // Therefore, features with Positive Correlation should have Positive Impact bars.
  // Features with Negative Correlation (if value was low) could also be positive, but for simplicity:
  // We align LIME direction with Correlation Direction to show "Logic".
  const limeValues = topFeatures.map(item => ({
      feature: item.name,
      value: item.impact * (0.5 + Math.random() * 0.5) // Direction matches correlation (Pos/Neg)
  }));


  // --- 6. Other Charts ---
  const residuals = [];
  for (let i = 0; i < 50; i++) {
    residuals.push({ x: Math.random() * 100, y: randn_bm() * 5 });
  }

  const learningCurve = [];
  for(let i = 10; i <= 100; i+=10) {
      learningCurve.push({
          x: i, 
          y: Math.min(metrics.accuracy, 0.5 + Math.log(i) * 0.1)
      })
  }

  const radarData = [
    { metric: 'Accuracy', value: metrics.accuracy, fullMark: 1 },
    { metric: 'Precision', value: metrics.precision, fullMark: 1 },
    { metric: 'Recall', value: metrics.recall, fullMark: 1 },
    { metric: 'F1 Score', value: metrics.f1Score, fullMark: 1 },
    { metric: 'AUC', value: metrics.auc || 0, fullMark: 1 },
  ];

  const words = ['dataset', 'features', 'model', 'training', 'accuracy', 'loss', 'python', 'algorithm', 'neural', 'predict'];
  const wordCloud = words.map(w => ({ text: w, value: Math.floor(Math.random() * 80) + 20 }));

  // --- 7. Explanation Text ---
  const cvText = modelConfig.crossValidation.enabled 
    ? `Validated using ${modelConfig.crossValidation.kFold}-Fold Cross-Validation` 
    : 'Validated using standard Train-Test split';

  const topFeatName = shapValues.length > 0 ? shapValues[0].feature : "Feature X";
  const secondFeatName = shapValues.length > 1 ? shapValues[1].feature : "Feature Y";

  const explanation = `
    The ${modelConfig.modelName} model achieved an Accuracy of ${(metrics.accuracy * 100).toFixed(1)}%.
    ${cvText}.
    
    Decision Analysis:
    • The Confusion Matrix indicates ${tp} True Positives and ${tn} True Negatives.
    • Key drivers for the model include "${topFeatName}" and "${secondFeatName}" based on statistical correlation with the target.
    
    Consistency Check:
    The LIME local explanation aligns with the global SHAP values. High values of "${topFeatName}" were found to significantly impact the prediction outcome, consistent with the dataset's correlation analysis.
  `;

  return {
    metrics,
    confusionMatrix,
    featureImportance: shapValues.map(s => ({ feature: s.feature, importance: Math.abs(s.value) })),
    lossHistory,
    rocCurve,
    precisionRecallCurve: prCurve,
    residuals,
    learningCurve,
    layerActivations: Array.from({ length: 20 }, () => Math.random()),
    pcaComponents,
    tsneComponents,
    umapComponents,
    shapValues,
    limeValues,
    wordCloud,
    explanation,
    modelCategory: modelConfig.category,
    radarData
  };
};