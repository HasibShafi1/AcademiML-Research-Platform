
import React, { useState, useMemo } from 'react';
import { TrainingResult, VizCategory, ModelCategory } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { Download, Share2, Grid, LayoutDashboard, Brain, FileText, Activity, Layers, Info, CheckCircle2, CheckSquare, Square } from 'lucide-react';

interface Props {
  result: TrainingResult | null;
}

const colors = {
  primary: '#6366f1',    // Indigo 500
  success: '#10b981',    // Emerald 500
  danger: '#ef4444',     // Red 500
  grid: '#334155',
  text: '#94a3b8'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg z-50">
        <p className="text-slate-900 dark:text-white font-semibold text-sm mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
           <p key={i} className="text-xs" style={{ color: p.color }}>
              {p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
           </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard = ({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 flex flex-col h-full ${className}`}>
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-6 flex justify-between items-center">
          {title}
      </h3>
      <div className="flex-grow min-h-[300px]">
          {children}
      </div>
  </div>
);

const ResultsSection: React.FC<Props> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<VizCategory>('ml');
  
  // State for Visualization Selector (Projections)
  const [selectedProjections, setSelectedProjections] = useState<string[]>(['pca']);

  const availableTabs = useMemo(() => {
    if (!result) return [];
    
    const tabs: {id: VizCategory, label: string, icon: any}[] = [
      { id: 'ml', label: 'Evaluation Metrics', icon: Activity },
      { id: 'preprocessing', label: 'Data Projection', icon: Grid },
      { id: 'explainability', label: 'Interpretability', icon: LayoutDashboard },
    ];

    if (result.modelCategory === ModelCategory.DL) {
        tabs.splice(1, 0, { id: 'dl', label: 'Deep Learning', icon: Layers });
    }
    
    if (result.modelCategory === ModelCategory.NLP) {
        tabs.push({ id: 'nlp', label: 'NLP Insights', icon: FileText });
    }

    return tabs;
  }, [result]);

  const toggleProjection = (id: string) => {
    setSelectedProjections(prev => 
        prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  if (!result) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400">
                    <CheckCircle2 size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Training Complete</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-semibold">{result.modelCategory}</span>
                        <span className="text-slate-400">•</span>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Accuracy: <span className="text-green-600 dark:text-green-400 font-bold">{(result.metrics.accuracy * 100).toFixed(1)}%</span></p>
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm">
                    <Download size={16} /> Model
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm text-white transition-colors shadow-lg shadow-primary-500/30">
                    <Share2 size={16} /> Report
                </button>
            </div>
        </div>

        {/* Insights Panel */}
        <div className="p-6 bg-primary-50 dark:bg-primary-900/10 border-b border-slate-100 dark:border-slate-800">
            <div className="flex gap-4">
                <Info className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                    <h4 className="font-semibold text-primary-900 dark:text-primary-100">Automated Analysis & Insights</h4>
                    <p className="text-sm text-primary-800 dark:text-primary-200/80 leading-relaxed whitespace-pre-line max-w-4xl">
                        {result.explanation}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {availableTabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                        ${activeTab === tab.id 
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'}
                    `}
                >
                    <tab.icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                    {tab.label}
                </button>
            ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="pb-12">
        
        {/* --- ML METRICS TAB --- */}
        {activeTab === 'ml' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <ChartCard title="Performance Radar" className="xl:col-span-2 md:col-span-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={result.radarData}>
                        <PolarGrid stroke={colors.grid} />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: colors.text, fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
                        <Radar name="Model Metrics" dataKey="value" stroke={colors.primary} fill={colors.primary} fillOpacity={0.5} />
                        <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Confusion Matrix" className="xl:col-span-2 md:col-span-2">
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                             {/* TN */}
                            <div className="bg-emerald-100 dark:bg-emerald-900/40 p-4 text-center rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col items-center justify-center aspect-square">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">{result.confusionMatrix[1][1]}</span>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1 uppercase">True Negative</span>
                            </div>
                             {/* FP */}
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 text-center rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center aspect-square">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">{result.confusionMatrix[0][1]}</span>
                                <span className="text-xs font-bold text-red-700 dark:text-red-400 mt-1 uppercase">False Positive</span>
                            </div>
                             {/* FN */}
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 text-center rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center aspect-square">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">{result.confusionMatrix[1][0]}</span>
                                <span className="text-xs font-bold text-red-700 dark:text-red-400 mt-1 uppercase">False Negative</span>
                            </div>
                             {/* TP */}
                            <div className="bg-emerald-100 dark:bg-emerald-900/40 p-4 text-center rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col items-center justify-center aspect-square">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">{result.confusionMatrix[0][0]}</span>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1 uppercase">True Positive</span>
                            </div>
                        </div>
                    </div>
                </ChartCard>

                <ChartCard title="ROC Curve" className="xl:col-span-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.rocCurve}>
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.5} />
                            <XAxis type="number" dataKey="x" label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5, fill: colors.text, fontSize: 10 }} stroke={colors.text} fontSize={12} />
                            <YAxis type="number" label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: colors.text, fontSize: 10 }} stroke={colors.text} fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="y" stroke={colors.primary} strokeWidth={3} dot={false} name="ROC" />
                            <Line data={[{x:0, y:0}, {x:1, y:1}]} type="linear" dataKey="y" stroke={colors.text} strokeDasharray="5 5" dot={false} strokeWidth={1} name="Random" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Learning Curve" className="xl:col-span-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.learningCurve}>
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.5} />
                            <XAxis dataKey="x" label={{ value: 'Training Size %', position: 'insideBottom', offset: -5, fill: colors.text, fontSize: 10 }} stroke={colors.text} fontSize={12} />
                            <YAxis domain={[0, 1]} stroke={colors.text} fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="y" stroke={colors.success} strokeWidth={3} dot={{r: 4}} name="Train Score" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        )}

        {/* --- DEEP LEARNING TAB --- */}
        {activeTab === 'dl' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 h-[400px]">
                    <ChartCard title="Loss & Accuracy History">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.lossHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.5} />
                                <XAxis dataKey="epoch" stroke={colors.text} fontSize={12} />
                                <YAxis stroke={colors.text} fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="loss" stroke={colors.danger} strokeWidth={2} dot={false} name="Train Loss" />
                                <Line type="monotone" dataKey="val_loss" stroke={colors.danger} strokeWidth={2} dot={false} strokeDasharray="3 3" name="Val Loss" />
                                <Line type="monotone" dataKey="accuracy" stroke={colors.primary} strokeWidth={2} dot={false} name="Train Acc" />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        )}

        {/* --- DATA PROJECTION (MULTI-SELECT) --- */}
        {activeTab === 'preprocessing' && (
            <div className="space-y-6">
                {/* Control Panel */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-6">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                        <Grid size={16} /> Select Projections:
                    </span>
                    {[
                        { id: 'pca', label: 'PCA (Linear)' },
                        { id: 'tsne', label: 't-SNE (Cluster)' },
                        { id: 'umap', label: 'UMAP (Manifold)' }
                    ].map(proj => (
                        <button
                            key={proj.id}
                            onClick={() => toggleProjection(proj.id)}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                ${selectedProjections.includes(proj.id) 
                                    ? 'bg-primary-600 text-white shadow-md' 
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 hover:border-primary-500'}
                            `}
                        >
                            {selectedProjections.includes(proj.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                            {proj.label}
                        </button>
                    ))}
                </div>

                {/* Grid Visualizer */}
                <div className={`grid gap-6 ${selectedProjections.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {selectedProjections.length === 0 && (
                        <div className="p-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            Select a visualization method above to view data projections.
                        </div>
                    )}
                    
                    {selectedProjections.includes('pca') && (
                        <ChartCard title="PCA Projection (2D)">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.5} />
                                    <XAxis type="number" dataKey="x" name="PC1" stroke={colors.text} fontSize={12} tick={false} />
                                    <YAxis type="number" dataKey="y" name="PC2" stroke={colors.text} fontSize={12} tick={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Scatter name="PCA" data={result.pcaComponents}>
                                        {result.pcaComponents.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.label === 'Class 0' ? colors.primary : colors.success} />
                                        ))}
                                    </Scatter>
                                    <Legend />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    )}

                    {selectedProjections.includes('tsne') && (
                         <ChartCard title="t-SNE Projection">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.5} />
                                    <XAxis type="number" dataKey="x" name="Dim 1" stroke={colors.text} fontSize={12} tick={false} />
                                    <YAxis type="number" dataKey="y" name="Dim 2" stroke={colors.text} fontSize={12} tick={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Scatter name="t-SNE" data={result.tsneComponents}>
                                        {result.tsneComponents.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.label === 'Class 0' ? colors.primary : colors.success} />
                                        ))}
                                    </Scatter>
                                    <Legend />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    )}

                    {selectedProjections.includes('umap') && (
                         <ChartCard title="UMAP Projection">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.5} />
                                    <XAxis type="number" dataKey="x" name="Dim 1" stroke={colors.text} fontSize={12} tick={false} />
                                    <YAxis type="number" dataKey="y" name="Dim 2" stroke={colors.text} fontSize={12} tick={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Scatter name="UMAP" data={result.umapComponents}>
                                        {result.umapComponents.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.label === 'Class 0' ? colors.primary : colors.success} />
                                        ))}
                                    </Scatter>
                                    <Legend />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    )}
                </div>
            </div>
        )}

        {/* --- EXPLAINABILITY TAB --- */}
        {activeTab === 'explainability' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="Global Feature Importance (SHAP)">
                    <p className="text-xs text-slate-500 mb-2">Features that most influence the model's overall predictions.</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.shapValues} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} opacity={0.5} />
                            <XAxis type="number" stroke={colors.text} fontSize={12} />
                            <YAxis dataKey="feature" type="category" stroke={colors.text} width={80} tick={{fontSize: 11}} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="SHAP Value" radius={[0, 4, 4, 0]}>
                                {result.shapValues.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.value > 0 ? colors.danger : colors.primary} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Local Explanation (LIME)">
                    <p className="text-xs text-slate-500 mb-2">Why did the model predict "Positive" for this specific instance?</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.limeValues} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} opacity={0.5} />
                            <XAxis type="number" stroke={colors.text} fontSize={12} />
                            <YAxis dataKey="feature" type="category" stroke={colors.text} width={80} tick={{fontSize: 11}} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" name="Impact" radius={[0, 4, 4, 0]}>
                                {result.limeValues.map((entry, index) => (
                                    // Visual Fix: Positive Impact = Indigo, Negative Impact = Red
                                    <Cell key={`cell-${index}`} fill={entry.value > 0 ? colors.primary : colors.danger} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-2 flex gap-4 justify-center text-xs">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-500 rounded-sm"></span> Supports Prediction</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Opposes Prediction</span>
                    </div>
                </ChartCard>
            </div>
        )}

        {/* --- NLP TAB --- */}
        {activeTab === 'nlp' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="Top Word Frequencies">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.wordCloud.slice(0, 10)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} opacity={0.5} />
                            <XAxis type="number" stroke={colors.text} fontSize={12} />
                            <YAxis dataKey="text" type="category" stroke={colors.text} width={80} tick={{fontSize: 12}} />
                            <Bar dataKey="value" fill={colors.success} radius={[0, 4, 4, 0]} />
                            <Tooltip content={<CustomTooltip />} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
                <ChartCard title="Word Cloud Visualization">
                    <div className="flex flex-wrap gap-3 justify-center content-center h-full p-4">
                        {result.wordCloud.map((w, i) => (
                            <span 
                                key={i} 
                                style={{ 
                                    fontSize: `${Math.max(0.8, w.value / 15)}rem`, 
                                    opacity: Math.max(0.4, w.value / 100) 
                                }}
                                className="text-primary-600 dark:text-primary-400 font-bold transition-all hover:scale-110 cursor-default"
                            >
                                {w.text}
                            </span>
                        ))}
                    </div>
                </ChartCard>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResultsSection;
