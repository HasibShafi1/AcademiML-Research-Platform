import { Dataset, DatasetColumn, ColumnStats } from '../types';

export const parseCSV = (content: string, filename: string): Dataset => {
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) throw new Error("Empty CSV file");

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rawData = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      // Try to parse number
      const val = values[index];
      // Check if it's a number and not an empty string
      const numVal = parseFloat(val);
      row[header] = !isNaN(numVal) && val !== '' ? numVal : val;
    });
    return row;
  });

  const columns: DatasetColumn[] = headers.map(header => {
    const values = rawData.map(row => row[header]);
    const missingCount = values.filter(v => v === '' || v === null || v === undefined).length;
    const uniqueCount = new Set(values).size;
    
    // Determine type based on first non-null value
    const firstNonEmpty = values.find(v => v !== '' && v !== null && v !== undefined);
    let type: 'number' | 'boolean' | 'string' = 'string';
    
    if (firstNonEmpty !== undefined) {
        if (typeof firstNonEmpty === 'number') type = 'number';
        else if (typeof firstNonEmpty === 'boolean') type = 'boolean';
    }
    
    return {
      name: header,
      type,
      missingCount,
      uniqueCount
    };
  });

  return {
    name: filename,
    rows: rawData,
    columns,
    totalRows: rawData.length
  };
};

// --- Statistics Utilities for Visualization ---

export const getNumericalColumns = (dataset: Dataset) => {
  return dataset.columns.filter(c => c.type === 'number').map(c => c.name);
};

export const getCategoricalColumns = (dataset: Dataset) => {
  return dataset.columns.filter(c => c.type === 'string' || c.type === 'boolean').map(c => c.name);
};

export const calculateHistogram = (dataset: Dataset, columnName: string, bins = 10) => {
  const values = dataset.rows.map(r => r[columnName]).filter(v => typeof v === 'number' && !isNaN(v));
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Bug Fix: Handle case where all values are the same (Variance = 0)
  if (min === max) {
      return [{ range: min.toString(), count: values.length }];
  }

  const range = max - min;
  const binSize = range / bins;

  // Initialize bins
  const histogram = Array(bins).fill(0).map((_, i) => ({
    range: `${(min + i * binSize).toFixed(1)} - ${(min + (i + 1) * binSize).toFixed(1)}`,
    count: 0
  }));

  values.forEach(v => {
    let binIndex = Math.floor((v - min) / binSize);
    if (binIndex >= bins) binIndex = bins - 1;
    if (binIndex < 0) binIndex = 0; // Safety check
    histogram[binIndex].count++;
  });

  return histogram;
};

export const calculateValueCounts = (dataset: Dataset, columnName: string, limit = 10) => {
  const counts: Record<string, number> = {};
  dataset.rows.forEach(r => {
    let val = r[columnName];
    if (val === null || val === undefined || val === '') val = 'Missing';
    const strVal = String(val);
    counts[strVal] = (counts[strVal] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
};

export const calculateColumnStats = (dataset: Dataset, columnName: string): ColumnStats => {
    const col = dataset.columns.find(c => c.name === columnName);
    if (!col) return { missing: 0, unique: 0, type: 'unknown' };

    const values = dataset.rows
        .map(r => r[columnName])
        .filter(v => v !== null && v !== undefined && v !== '');
    
    const stats: ColumnStats = {
        missing: col.missingCount,
        unique: col.uniqueCount,
        type: col.type
    };

    if (col.type === 'number' && values.length > 0) {
        const nums = values as number[];
        const sum = nums.reduce((a, b) => a + b, 0);
        stats.mean = parseFloat((sum / nums.length).toFixed(2));
        stats.min = Math.min(...nums);
        stats.max = Math.max(...nums);
        
        // Median
        const sorted = [...nums].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        stats.median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

        // Std Dev
        const variance = nums.reduce((a, b) => a + Math.pow(b - stats.mean!, 2), 0) / nums.length;
        stats.std = parseFloat(Math.sqrt(variance).toFixed(2));
    }

    return stats;
}

export const calculateCorrelation = (x: number[], y: number[]) => {
  const n = x.length;
  if (n === 0) return 0;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

export const generateCorrelationMatrix = (dataset: Dataset) => {
  // Limit to top 15 numerical columns to prevent browser crash on large datasets
  const numericCols = getNumericalColumns(dataset).slice(0, 15);
  if (numericCols.length < 2) return [];

  const matrix: { x: string, y: string, value: number }[] = [];

  for (let i = 0; i < numericCols.length; i++) {
    for (let j = 0; j < numericCols.length; j++) {
      const colA = numericCols[i];
      const colB = numericCols[j];
      
      // Filter out rows where either A or B is missing for calculation accuracy
      const cleanRows = dataset.rows.filter(r => 
        typeof r[colA] === 'number' && !isNaN(r[colA]) &&
        typeof r[colB] === 'number' && !isNaN(r[colB])
      );

      const valuesA = cleanRows.map(r => r[colA] as number);
      const valuesB = cleanRows.map(r => r[colB] as number);
      
      const corr = calculateCorrelation(valuesA, valuesB);
      matrix.push({ x: colA, y: colB, value: isNaN(corr) ? 0 : parseFloat(corr.toFixed(2)) });
    }
  }
  return matrix;
};

// --- Data Aware Simulation Utils ---

export const calculateFeatureImpacts = (dataset: Dataset, targetCol: string): { name: string, impact: number }[] => {
  if (!targetCol) return [];

  // 1. Convert target to numerical for correlation calc
  const targetRaw = dataset.rows.map(r => r[targetCol]);
  let targetNums: number[] = [];
  
  const targetIsString = typeof targetRaw.find(v => v !== null) === 'string';
  if (targetIsString) {
      // Simple label encoding for target
      const uniqueVals = Array.from(new Set(targetRaw));
      targetNums = targetRaw.map(v => uniqueVals.indexOf(v));
  } else {
      targetNums = targetRaw as number[];
  }

  // 2. Iterate all other columns and find correlation
  const impacts: { name: string, impact: number }[] = [];
  
  dataset.columns.forEach(col => {
      if (col.name === targetCol) return;

      const rawVals = dataset.rows.map(r => r[col.name]);
      let nums: number[] = [];

      // Handle non-numeric features by simple mapping for correlation approximation
      if (col.type !== 'number') {
          const uniqueVals = Array.from(new Set(rawVals));
          nums = rawVals.map(v => uniqueVals.indexOf(v));
      } else {
          nums = rawVals as number[];
      }
      
      // Calculate correlation
      const corr = calculateCorrelation(nums, targetNums);
      // We take absolute value for magnitude of importance, but keep sign for directionality in LIME
      impacts.push({ name: col.name, impact: isNaN(corr) ? 0 : corr });
  });

  // Sort by absolute impact
  return impacts.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
};


// --- Sample Datasets ---

const TITANIC_CSV = `Survived,Pclass,Sex,Age,SibSp,Parch,Fare,Embarked
0,3,male,22,1,0,7.25,S
1,1,female,38,1,0,71.2833,C
1,3,female,26,0,0,7.925,S
1,1,female,35,1,0,53.1,S
0,3,male,35,0,0,8.05,S
0,3,male,27,0,0,8.4583,Q
0,1,male,54,0,0,51.8625,S
0,3,male,2,3,1,21.075,S
1,3,female,27,0,2,11.1333,S
1,2,female,14,1,0,30.0708,C`;

const IRIS_CSV = `sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
4.7,3.2,1.3,0.2,setosa
7.0,3.2,4.7,1.4,versicolor
6.4,3.2,4.5,1.5,versicolor
6.9,3.1,4.9,1.5,versicolor
6.3,3.3,6.0,2.5,virginica
5.8,2.7,5.1,1.9,virginica
7.1,3.0,5.9,2.1,virginica`;

const HOUSING_CSV = `avg_area_income,avg_area_house_age,avg_area_rooms,avg_area_bedrooms,area_population,price
79545.45,5.68,7.00,4.09,23086.80,1059033.55
79248.64,6.00,6.73,3.09,40173.07,1505890.91
61287.06,5.86,8.51,5.13,36882.15,1058987.98
63345.24,7.18,5.58,3.26,34310.24,1260616.80
59982.19,5.04,7.83,4.23,26354.10,630943.48
80175.75,4.98,6.10,4.04,26748.42,1068138.07
64698.46,6.02,8.14,3.41,60828.24,1502056.09`;

const WINE_CSV = `fixed acidity,volatile acidity,citric acid,residual sugar,chlorides,free sulfur dioxide,total sulfur dioxide,density,pH,sulphates,alcohol,quality
7.4,0.7,0,1.9,0.076,11,34,0.9978,3.51,0.56,9.4,5
7.8,0.88,0,2.6,0.098,25,67,0.9968,3.2,0.68,9.8,5
7.8,0.76,0.04,2.3,0.092,15,54,0.997,3.26,0.65,9.8,5
11.2,0.28,0.56,1.9,0.075,17,60,0.998,3.16,0.58,9.8,6
7.4,0.7,0,1.9,0.076,11,34,0.9978,3.51,0.56,9.4,5
7.4,0.66,0,1.8,0.075,13,40,0.9978,3.51,0.56,9.4,5
7.9,0.6,0.06,1.6,0.069,15,59,0.9964,3.3,0.46,9.4,5
7.3,0.65,0,1.2,0.065,15,21,0.9946,3.39,0.47,10,7
7.8,0.58,0.02,2,0.073,9,18,0.9968,3.36,0.57,9.5,7`;

export const getSampleDataset = (type: 'titanic' | 'iris' | 'housing' | 'wine'): Dataset => {
  switch (type) {
    case 'titanic': return parseCSV(TITANIC_CSV, 'Titanic_Sample.csv');
    case 'iris': return parseCSV(IRIS_CSV, 'Iris_Sample.csv');
    case 'housing': return parseCSV(HOUSING_CSV, 'Housing_Prices_Sample.csv');
    case 'wine': return parseCSV(WINE_CSV, 'Wine_Quality_Sample.csv');
  }
};