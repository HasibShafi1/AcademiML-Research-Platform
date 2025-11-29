import React, { useState, useMemo, useEffect } from 'react';
import { BarChart2, ChevronDown, Activity, PieChart, TableProperties, AlertTriangle } from 'lucide-react';
import { Dataset } from '../types';
import { 
  getNumericalColumns, 
  getCategoricalColumns, 
  calculateHistogram, 
  calculateValueCounts,
  generateCorrelationMatrix,
  calculateColumnStats
} from '../services/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell
} from 'recharts';

interface Props {
  dataset: Dataset | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const DataAnalysisSection: React.FC<Props> = ({ dataset, isExpanded, onToggleExpand }) => {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [vizType, setVizType] = useState<'univariate' | 'bivariate'>('univariate');

  const numericalCols = useMemo(() => dataset ? getNumericalColumns(dataset) : [], [dataset]);
  const categoricalCols = useMemo(() => dataset ? getCategoricalColumns(dataset) : [], [dataset]);
  
  // Bug fix: Reset selected column if it doesn't exist in the new dataset
  useEffect(() => {
    if (dataset) {
      if (!selectedColumn || !dataset.columns.find(c => c.name === selectedColumn)) {
        if (numericalCols.length > 0) setSelectedColumn(numericalCols[0]);
        else if (categoricalCols.length > 0) setSelectedColumn(categoricalCols[0]);
      }
    } else {
        setSelectedColumn('');
    }
  }, [dataset, numericalCols, categoricalCols]);

  // Determine chart type based on selected column type
  const isNumerical = useMemo(() => numericalCols.includes(selectedColumn), [selectedColumn, numericalCols]);

  const chartData = useMemo(() => {
    if (!dataset || !selectedColumn || vizType !== 'univariate') return [];
    if (isNumerical) {
      return calculateHistogram(dataset, selectedColumn);
    } else {
      return calculateValueCounts(dataset, selectedColumn);
    }
  }, [dataset, selectedColumn, vizType, isNumerical]);

  const columnStats = useMemo(() => {
      if(!dataset || !selectedColumn) return null;
      return calculateColumnStats(dataset, selectedColumn);
  }, [dataset, selectedColumn]);

  const correlationData = useMemo(() => {
    if (!dataset || vizType !== 'bivariate') return [];
    return generateCorrelationMatrix(dataset);
  }, [dataset, vizType]);

  if (!dataset) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all duration-300">
      <div 
        className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-t-xl"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
            <PieChart size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Exploratory Data Analysis</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Visualize distributions and correlations</p>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
           <ChevronDown className="text-slate-400" />
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-800">
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit mb-6">
            <button
              onClick={() => setVizType('univariate')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                vizType === 'univariate'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart2 size={16} /> Distributions
            </button>
            <button
              onClick={() => setVizType('bivariate')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                vizType === 'bivariate'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Activity size={16} /> Correlations
            </button>
          </div>

          <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            {vizType === 'univariate' && (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Chart Section */}
                <div className="flex-grow flex flex-col min-h-[400px]">
                    <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                        <div>
                           <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                {isNumerical ? 'Histogram & Density' : 'Value Counts'}
                           </h3>
                           <p className="text-xs text-slate-500">{isNumerical ? 'Distribution of numerical values' : 'Frequency of categorical values'}</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label className="text-sm text-slate-500 whitespace-nowrap">Feature:</label>
                            <select 
                                value={selectedColumn}
                                onChange={(e) => setSelectedColumn(e.target.value)}
                                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                            >
                                <optgroup label="Numerical">
                                {numericalCols.map(c => <option key={c} value={c}>{c}</option>)}
                                </optgroup>
                                <optgroup label="Categorical">
                                {categoricalCols.map(c => <option key={c} value={c}>{c}</option>)}
                                </optgroup>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex-1 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:opacity-10" />
                        <XAxis 
                            dataKey={isNumerical ? "range" : "name"} 
                            stroke="#94a3b8" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            interval={0}
                            tick={({ x, y, payload }) => (
                                <g transform={`translate(${x},${y})`}>
                                    <text x={0} y={0} dy={16} textAnchor="end" fill="#94a3b8" fontSize={10} transform="rotate(-25)">
                                        {payload.value.length > 10 ? payload.value.substring(0, 10) + '...' : payload.value}
                                    </text>
                                </g>
                            )}
                            height={60}
                        />
                        <YAxis 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                            itemStyle={{ color: '#818cf8' }}
                            cursor={{ fill: 'currentColor', opacity: 0.1 }}
                        />
                        <Bar dataKey={isNumerical ? "count" : "value"} name="Count" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#6366f1" />
                            ))}
                        </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700 h-full">
                        <div className="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400">
                             <TableProperties size={18} />
                             <h4 className="font-bold text-sm uppercase tracking-wide">Statistics</h4>
                        </div>
                        
                        {columnStats && (
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs text-slate-500 uppercase block mb-1">Type</span>
                                    <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-700 dark:text-slate-300">
                                        {columnStats.type}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase block">Unique</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{columnStats.unique}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase block">Missing</span>
                                        <span className={`font-semibold ${columnStats.missing > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            {columnStats.missing}
                                        </span>
                                    </div>
                                </div>

                                {isNumerical && (
                                    <>
                                        <hr className="border-slate-100 dark:border-slate-700" />
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-500">Mean</span>
                                                <span className="text-sm font-medium dark:text-slate-300">{columnStats.mean}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-500">Median</span>
                                                <span className="text-sm font-medium dark:text-slate-300">{columnStats.median}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-500">Std Dev</span>
                                                <span className="text-sm font-medium dark:text-slate-300">{columnStats.std}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-500">Min</span>
                                                <span className="text-sm font-medium dark:text-slate-300">{columnStats.min}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-500">Max</span>
                                                <span className="text-sm font-medium dark:text-slate-300">{columnStats.max}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
              </div>
            )}

            {vizType === 'bivariate' && (
              <div className="h-full flex flex-col">
                 <div className="mb-4 flex justify-between items-start">
                    <div>
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Correlation Heatmap</h3>
                        <p className="text-sm text-slate-500">Pearson correlation coefficient between numerical features</p>
                    </div>
                    {numericalCols.length > 15 && (
                         <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-2 rounded-lg text-xs">
                             <AlertTriangle size={14} />
                             Showing top 15 columns for performance
                         </div>
                    )}
                 </div>
                 {correlationData.length > 0 ? (
                   <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner max-h-[500px]">
                      <div 
                        className="grid gap-1"
                        style={{ 
                          gridTemplateColumns: `auto repeat(${Math.min(numericalCols.length, 15)}, minmax(40px, 1fr))`,
                        }}
                      >
                        {/* Header Row */}
                        <div className="bg-transparent"></div>
                        {numericalCols.slice(0, 15).map(col => (
                          <div key={col} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 -rotate-90 origin-bottom-left translate-x-3 mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-[40px]" title={col}>
                            {col}
                          </div>
                        ))}

                        {/* Data Rows */}
                        {numericalCols.slice(0, 15).map((rowCol, rIdx) => (
                          <React.Fragment key={rowCol}>
                            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-end pr-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]" title={rowCol}>
                              {rowCol}
                            </div>
                            {numericalCols.slice(0, 15).map((colCol, cIdx) => {
                              const item = correlationData.find(d => d.x === rowCol && d.y === colCol);
                              const val = item ? item.value : 0;
                              // Dynamic Color
                              const opacity = Math.abs(val);
                              // Blue for positive, Red for negative
                              const r = val > 0 ? 59 : 239; 
                              const g = val > 0 ? 130 : 68;
                              const b = val > 0 ? 246 : 68;
                              
                              return (
                                <div 
                                  key={`${rIdx}-${cIdx}`} 
                                  className="aspect-square flex items-center justify-center text-[9px] rounded hover:scale-110 relative z-0 hover:z-10 cursor-help transition-transform"
                                  style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`, color: opacity > 0.6 ? 'white' : (document.documentElement.classList.contains('dark') ? '#94a3b8' : '#1e293b') }}
                                  title={`${rowCol} vs ${colCol}: ${val}`}
                                >
                                  {val.toFixed(2)}
                                </div>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                   </div>
                 ) : (
                   <div className="flex items-center justify-center h-full text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-12">
                     Insufficient numeric data for correlation.
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalysisSection;